package database

import (
	"fmt"
	"testing"

	"github.com/gobackup/gobackup/config"
	"github.com/longbridgeapp/assert"
)

func init() {
	if err := config.Init("../gobackup_test.yml"); err != nil {
		panic(err.Error())
	}
}

type Monkey struct {
	Base
}

func (db Monkey) perform() error {
	if db.model.Name != "TestMonkey" {
		return fmt.Errorf("Error")
	}
	if db.dbConfig.Name != "postgresql1" {
		return fmt.Errorf("Error")
	}
	return nil
}

func TestBaseInterface(t *testing.T) {
	base := Base{
		model: config.ModelConfig{
			Name: "TestMonkey",
		},
		dbConfig: config.SubConfig{
			Name: "postgresql1",
		},
	}
	db := Monkey{Base: base}
	err := db.perform()
	assert.Nil(t, err)
}

func TestBase_newBase(t *testing.T) {
	model := config.ModelConfig{
		DumpPath: "/tmp/gobackup/test",
	}
	dbConfig := config.SubConfig{
		Type: "postgresql",
		Name: "postgresql-master",
	}
	base := newBase(model, dbConfig)

	assert.Equal(t, base.model, model)
	assert.Equal(t, base.dbConfig, dbConfig)
	assert.Equal(t, base.viper, dbConfig.Viper)
	assert.Equal(t, base.name, "postgresql-master")
	assert.Equal(t, base.dumpPath, "/tmp/gobackup/test/postgresql/postgresql-master")
}
