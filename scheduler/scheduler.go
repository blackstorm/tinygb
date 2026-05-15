package scheduler

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/go-co-op/gocron"
	"github.com/gobackup/gobackup/config"
	superlogger "github.com/gobackup/gobackup/logger"
	"github.com/gobackup/gobackup/model"
)

var (
	mycron *gocron.Scheduler

	// Regex to match duration strings with extended units like "1day", "2weeks", etc.
	extendedDurationRegex = regexp.MustCompile(`^(\d+)\s*(day|days|d|week|weeks|w|month|months)$`)
)

// parseDuration parses a duration string, supporting extended units like "day", "week", "month"
// in addition to Go's standard time.ParseDuration units.
func parseDuration(s string) (time.Duration, error) {
	// First try Go's standard ParseDuration
	if d, err := time.ParseDuration(s); err == nil {
		return d, nil
	}

	// Try to match extended units (case-insensitive)
	matches := extendedDurationRegex.FindStringSubmatch(strings.ToLower(s))
	if matches == nil {
		return 0, fmt.Errorf("invalid duration format: %s", s)
	}

	value, _ := strconv.Atoi(matches[1])
	unit := matches[2]

	switch unit {
	case "day", "days", "d":
		return time.Duration(value) * 24 * time.Hour, nil
	case "week", "weeks", "w":
		return time.Duration(value) * 7 * 24 * time.Hour, nil
	case "month", "months":
		// Approximate month as 30 days
		return time.Duration(value) * 30 * 24 * time.Hour, nil
	}

	return 0, fmt.Errorf("invalid duration format: %s", s)
}

func init() {
	config.OnConfigChange(func(in fsnotify.Event) {
		Restart()
	})
}

func buildSchedule(cron *gocron.Scheduler, schedule config.ScheduleConfig) (*gocron.Scheduler, error) {
	if schedule.Cron != "" {
		return cron.Cron(schedule.Cron), nil
	}

	if schedule.Every == "" {
		return nil, fmt.Errorf("schedule every is empty")
	}

	duration, err := parseDuration(schedule.Every)
	if err != nil {
		return nil, err
	}

	if len(schedule.At) > 0 {
		scheduler, err := buildAtSchedule(cron, schedule.Every)
		if err != nil {
			return nil, err
		}
		return scheduler.At(schedule.At), nil
	}

	return cron.Every(duration).StartAt(time.Now().Add(duration)), nil
}

func buildAtSchedule(cron *gocron.Scheduler, every string) (*gocron.Scheduler, error) {
	matches := extendedDurationRegex.FindStringSubmatch(strings.ToLower(every))
	if matches == nil {
		return nil, fmt.Errorf("schedule at is only supported with day, week, or month intervals")
	}

	value, _ := strconv.Atoi(matches[1])
	scheduler := cron.Every(value)

	switch matches[2] {
	case "day", "days", "d":
		return scheduler.Day(), nil
	case "week", "weeks", "w":
		return scheduler.Week(), nil
	case "month", "months":
		return scheduler.Month(), nil
	}

	return nil, fmt.Errorf("invalid duration format: %s", every)
}

// Start scheduler
func Start() error {
	logger := superlogger.Tag("Scheduler")

	mycron = gocron.NewScheduler(time.Local)

	mu := sync.Mutex{}

	for _, modelConfig := range config.Models {
		if !modelConfig.Schedule.Enabled {
			continue
		}

		logger.Info(fmt.Sprintf("Register %s with (%s)", modelConfig.Name, modelConfig.Schedule.String()))

		scheduler, err := buildSchedule(mycron, modelConfig.Schedule)
		if err != nil {
			logger.Errorf("Failed to register schedule: %s", err.Error())
			continue
		}

		if _, err := scheduler.Do(func(modelConfig config.ModelConfig) {
			defer mu.Unlock()
			logger := superlogger.Tag(fmt.Sprintf("Scheduler: %s", modelConfig.Name))

			logger.Info("Performing...")

			m := model.Model{
				Config: modelConfig,
			}
			mu.Lock()
			if err := m.Perform(); err != nil {
				logger.Errorf("Failed to perform: %s", err.Error())
			}
			logger.Info("Done.")
		}, modelConfig); err != nil {
			logger.Errorf("Failed to register job func: %s", err.Error())
		}
	}

	mycron.StartAsync()

	return nil
}

func Restart() error {
	logger := superlogger.Tag("Scheduler")
	logger.Info("Reloading...")
	Stop()
	return Start()
}

func Stop() {
	if mycron != nil {
		mycron.Stop()
	}
}
