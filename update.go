package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	"github.com/codeskyblue/goreq"
	"github.com/getlantern/go-update"
	"github.com/mitchellh/ioprogress"
)

var baseurl string = "safe-sig.bj.bcebos.com/opinit/atx-agent"

func formatString(format string, params map[string]string) string {
	for k, v := range params {
		format = strings.Replace(format, "{"+k+"}", v, -1)
	}
	return format
}

func makeTempDir() string {
	target := filepath.Join(tmpPath, "atx-update.tmp")
	os.MkdirAll(target, 0755)
	return target
}

func getLatestVersion() (version string, err error) {
	res, err := goreq.Request{
		Uri: "http://" + baseurl + "/latest",
	}.Do()
	if err != nil {
		return
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("http status code is not 200, got %d", res.StatusCode)
	}
	ver, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	return strings.Trim(string(ver), "\n"), nil
}

func doUpdate(version string) (err error) {
	if version == "" {
		version, err = getLatestVersion()
		if err != nil {
			return err
		}
	}
	filename := fmt.Sprintf("%s_%s_%s_%s", repo, version, runtime.GOOS, runtime.GOARCH)
	log.Printf("update file: %s", filename)

	// fixed get latest version
	atxAgentUrl := formatString("http://{baseurl}/{filename}", map[string]string{
		"baseurl":  baseurl,
		"filename": filename,
	})
	log.Printf("update url: %s", atxAgentUrl)
	res, err := goreq.Request{
		Uri:             atxAgentUrl,
		MaxRedirects:    10,
		RedirectHeaders: true,
	}.Do()
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		err = fmt.Errorf("HTTP download error: [%d] %s", res.StatusCode, res.Status)
		return err
	}
	contentLength, err := strconv.Atoi(res.Header.Get("Content-Length"))
	if err != nil {
		return err
	}
	hasher := sha256.New()
	progressR := &ioprogress.Reader{
		Reader:   res.Body,
		Size:     int64(contentLength),
		DrawFunc: ioprogress.DrawTerminalf(os.Stdout, ioprogress.DrawTextFormatBytes),
	}
	tmpdir := makeTempDir()
	distPath := filepath.Join(tmpdir, repo)
	f, err := os.Create(distPath)
	if err != nil {
		return err
	}
	writer := io.MultiWriter(f, hasher)
	io.Copy(writer, progressR)
	if err = f.Close(); err != nil {
		return err
	}
	log.Println("perform updating")
	err, _ = update.New().FromFile(filepath.Join(tmpdir, repo))
	return err
}
