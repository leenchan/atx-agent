package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/pkg/errors"
	"github.com/robfig/cron"
)

type MonitorInfo struct {
	Timestamp   int64  `json:"timestamp,omitempty"`
	CpuInfo     string `json:"cpu,omitempty"`
	MemoryInfo  string `json:"mem,omitempty"`
	CpuTempInfo string `json:"temp,omitempty"`
}

type ParseInfo struct {
	IP           string `json:"ip,omitempty"`
	Serial       string `json:"serial,omitempty"`
	Cores        int    `json:"cpuCores,omitempty"`
	CPU          string `json:"cpu,omitempty"`
	Sdk          int    `json:"sdkVersion,omitempty"`
	ImageVersion string `json:"imageVersion,omitempty"`
	AppVersion   string `json:"appVersion,omitempty"`
	Memory       int    `json:"memory,omitempty"`
}

// Report http server
func reportServer(url string, content []byte, contentType string) (string, error) {
	// log.Infof("content info: %s", content)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(content))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", contentType)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", errors.New("push http error code: " + resp.Status)
	}
	body, _ := ioutil.ReadAll(resp.Body)
	return string(body), nil
}

// cpu Memory temperature
func monitor(addr string) {
	log.Infof("Enter monitoring report [%s]\n", addr)
	job := cron.New()
	// 信息上报
	job.AddFunc("0 0/1 * * * ?", func() {
		memoryInfo, _ := parseAllMemoryInfo()
		cpuInfo, _ := parseAllTopCPUInfo()
		tempInfo, _ := parseCPUTempInfo()
		info := &MonitorInfo{
			Timestamp:   time.Now().Unix(),
			CpuInfo:     cpuInfo,
			MemoryInfo:  memoryInfo,
			CpuTempInfo: tempInfo,
		}
		str, err := json.Marshal(info)
		if err != nil {
			log.Error(err)
		}
		monitor, err :=
			reportServer(addr+"/device/perf/"+getCachedProperty("ro.serialno"), str, "application/json")
		if err != nil {
			log.Error(err)
		}
		log.Infof("monitor report result [%s]\n", monitor)
	})

	go job.Start()
}

// IP addr 上报
func parseIPInfo(addr string, ip string) error {
	log.Infof("IP地址上报 [%s]\n", addr)
	deviceInfo := getDeviceInfo()
	//reflect.ValueOf(deviceInfo).Elem().Field(8).SetString(ip)
	content, err := ioutil.ReadFile("/data/versions.txt")
	info := &ParseInfo{
		Serial:       deviceInfo.Serial,
		IP:           ip,
		Cores:        deviceInfo.Cpu.Cores,
		CPU:          getCachedProperty("ro.product.cpu.abi"),
		Sdk:          deviceInfo.Sdk,
		ImageVersion: getCachedProperty("ro.build.id"),
		AppVersion:   string(content),
		Memory:       deviceInfo.Memory.Total,
	}
	str, err := json.Marshal(info)
	if err != nil {
		return err
	}
	body, err := reportServer(addr+"/device/report", str, "application/json")
	log.Infof("IP地址上报结果 [%s] \n", body)
	return err
}

// parse all Memory Info
func parseAllMemoryInfo() (info string, err error) {
	output, err := Command{
		Args:    []string{"dumpsys", "meminfo", "--local"},
		Timeout: 60 * time.Second,
	}.CombinedOutputString()
	if err != nil {
		log.Error(err)
		return
	}
	info = output
	return
}

// parse all top CPU Info
func parseAllTopCPUInfo() (info string, err error) {
	cmd := []string{"top", "-b", "-n", "1", "-d", "1"}
	sdk, err := strconv.Atoi(getCachedProperty("ro.build.version.sdk"))
	// 兼容低版本 Android
	if sdk < 28 {
		cmd = append(cmd[:1], cmd[2:]...)
	}
	output, err := Command{
		Args:    cmd,
		Timeout: 10 * time.Second,
	}.CombinedOutputString()
	if err != nil {
		log.Error(err)
		return
	}
	info = output
	return
}

// parse CPU temperature Info
func parseCPUTempInfo() (info string, err error) {
	output, err := Command{
		Args:    []string{"cat", "/sys/class/thermal/thermal_zone0/temp"},
		Timeout: 10 * time.Second,
	}.CombinedOutputString()
	if err != nil {
		log.Error(err)
		return
	}

	if output == "" {
		err = errors.New("cat CPU temperature error")
		return
	}
	info = output
	return
}
