# Guide for releasing a new version

Create a new tag and push it:

```bash
git tag -a v2.5.1 -m "v2.5.1"
git push origin v2.5.1
```

Build release artifacts from source. For Docker images, use the multi-stage Dockerfile:

```bash
docker build --build-arg VERSION=v2.5.1 -t tinygb:v2.5.1 .
```

For a local binary install, use:

```bash
./install v2.5.1
```

Then create or edit the release notes in this repository's GitHub Releases page.
