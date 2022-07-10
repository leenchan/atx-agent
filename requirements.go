package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/openatx/androidutils"
)

const (
	apkVersionName = "2.3.3"
)

func init() {
	go installRequirements()
}

func installRequirements() error {
	// log.Println("install uiautomator apk")
	// if err := installUiautomatorAPK(); err != nil {
	// 	return err
	// }
	log.Println("install minitouch")
	if err := installMinitouch(); err != nil {
		return err
	}
	log.Println("install minicap")
	if err := installMinicap(); err != nil {
		return err
	}
	return nil
}

func installUiautomatorAPK() error {
	if runtime.GOOS == "windows" {
		return nil
	}
	if checkUiautomatorInstalled() {
		return nil
	}
	appDebug := filepath.Join(expath, "app-uiautomator.apk")
	appDebugURL := formatString("http://{baseurl}/uiautomator/{version}/{apk}", map[string]string{
		"baseurl": baseurl,
		"version": apkVersionName,
		"apk":     "app-uiautomator.apk",
	})
	if _, err := httpDownload(appDebug, appDebugURL, 0644); err != nil {
		return err
	}
	if err := forceInstallAPK(appDebug); err != nil {
		return err
	}

	appDebugTest := filepath.Join(expath, "app-uiautomator-test.apk")
	appDebugTestURL := formatString("http://{baseurl}/uiautomator/{version}/{apk}", map[string]string{
		"baseurl": baseurl,
		"version": apkVersionName,
		"apk":     "app-uiautomator-test.apk",
	})
	if _, err := httpDownload(appDebugTest, appDebugTestURL, 0644); err != nil {
		return err
	}
	if err := forceInstallAPK(appDebugTest); err != nil {
		return err
	}

	return nil
}

func installMinicap() error {
	minicapbin := filepath.Join(expath, "minicap")
	minicapso := filepath.Join(expath, "minicap.so")
	if fileExists(minicapbin) && fileExists(minicapso) {
		return nil
	}
	if runtime.GOOS == "windows" {
		return nil
	}
	log.Println("install minicap")
	if fileExists(minicapbin) && fileExists(minicapso) {
		if err := Screenshot("/dev/null", ""); err != nil {
			log.Println("err:", err)
		} else {
			return nil
		}
	}
	// remove first to prevent "text file busy"
	os.Remove(minicapbin)
	os.Remove(minicapso)

	abi := getCachedProperty("ro.product.cpu.abi")
	sdk := getCachedProperty("ro.build.version.sdk")
	pre := getCachedProperty("ro.build.version.preview_sdk")
	if pre != "" && pre != "0" {
		sdk = sdk + pre
	}
	if sdk == "32" {
		sdk = "31"
	}

	// binURL := formatString("http://{baseurl}/{path}/{abi}/{bin}", map[string]string{
	// 	"baseurl": baseurl,
	// 	"path":    "stf-binaries/node_modules/@devicefarmer/minicap-prebuilt/prebuilt",
	// 	"abi":     abi,
	// 	"bin":     "bin/minicap",
	// })
	binURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/" + abi + "/minicap"
	//binURL := strings.Join([]string{minicapSource, abi, "bin", "minicap"}, "/")
	_, err := httpDownload(minicapbin, binURL, 0755)
	if err != nil {
		return err
	}

	// libURL := formatString("http://{baseurl}/{path}/{abi}/lib/{lib}/{so}", map[string]string{
	// 	"baseurl": baseurl,
	// 	"path":    "stf-binaries/node_modules/@devicefarmer/minicap-prebuilt/prebuilt",
	// 	"abi":     abi,
	// 	"lib":     "android-" + sdk,
	// 	"so":      "minicap.so",
	// })
	libURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/minicap-shared/aosp/libs/android-" + sdk + "/" + abi + "/minicap.so"
	//libURL := strings.Join([]string{minicapSource, abi, "lib", "android-" + sdk, "minicap.so"}, "/")
	_, err = httpDownload(minicapso, libURL, 0644)
	if err != nil {
		return err
	}
	return nil
}

func installMinitouch() error {
	minitouchbin := filepath.Join(expath, "minitouch")
	if fileExists(minitouchbin) {
		return nil
	}
	binURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/" + getCachedProperty("ro.product.cpu.abi") + "/minitouch"
	// binURL := formatString("http://{baseurl}/{path}/{abi}/{bin}", map[string]string{
	// 	"baseurl": baseurl,
	// 	"path":    "stf-binaries/node_modules/@devicefarmer/minitouch-prebuilt/prebuilt",
	// 	"abi":     getCachedProperty("ro.product.cpu.abi"),
	// 	"bin":     "bin/minitouch",
	// })
	_, err := httpDownload(minitouchbin, binURL, 0755)
	return err
}

func installPythonForAndroid() error {
	// https://github.com/yan12125/python3-android/releases
	if pi, err := androidutils.StatPackage("com.googlecode.android_scripting"); err == nil {
		fmt.Printf("SL4A\nversion name:(%s)\nversion code:(%d)\n", pi.Version.Name, pi.Version.Code)
	} else {
		abi := getCachedProperty("ro.product.cpu.abi")
		abiMap := map[string]string{"armeabi-v7a": "armv7", "armeabi": "arm", "x86": "x86", "mips": "mips"}
		arch, ok := abiMap[abi]
		if !ok {
			return errors.New("Sorry, not support this Arch.")
		}
		sl4aApkUrl := "https://github.com/kuri65536/sl4a/releases/download/6.2.0/sl4a-r6.2.0-" + arch + "-debug.apk"
		if _, err := httpDownload(filepath.Join(expath, "sl4a.apk"), sl4aApkUrl, 0644); err != nil {
			return err
		}
		if err := forceInstallAPK(filepath.Join(expath, "sl4a.apk")); err != nil {
			return err
		}
	}
	if pi, err := androidutils.StatPackage("com.googlecode.pythonforandroid"); err == nil {
		fmt.Printf("Python For Android\nversion name:(%s)\nversion code:(%d)\n", pi.Version.Name, pi.Version.Code)
	} else {
		pythonforandroidApkUrl := "https://github.com/kuri65536/python-for-android/releases/download/r32/Python3ForAndroid-debug.apk"
		if _, err := httpDownload(filepath.Join(expath, "python_for_android.apk"), pythonforandroidApkUrl, 0644); err != nil {
			return err
		}
		if err := forceInstallAPK(filepath.Join(expath, "python_for_android.apk")); err != nil {
			return err
		}
	}
	return nil
}

func installAudioSource() {
	// https://github.com/gdzx/audiosource
	// https://dzx.fr/blog/low-latency-microphone-audio-android/
	// am start fr.dzx.audiosource/.MainActivity
}

func installFileBrowser() error {
	expath, _ = os.Getwd()
	dlDir := filepath.Join(expath, "dl")
	if _, err := os.Stat(dlDir); err != nil {
		err := os.Mkdir(dlDir, 0777)
		if err != nil {
			return err
		}
	}
	abi := getCachedProperty("ro.product.cpu.abi")
	// abi := "armeabi-v7a"
	abiMap := map[string]string{"armeabi-v7a": "armv7", "arm64-v8a": "arm64", "x86": "386", "x86_64": "amd64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}
	filebrowserBin := filepath.Join(expath, "filebrowser")
	url, err := getGithubLatestReleaseUrl("filebrowser/filebrowser", "[^\"]+linux-"+arch+"[^\"]+")
	if err != nil {
		return err
	}
	fmt.Println("Download: " + url)
	tarFileName := url[strings.LastIndex(url, "/")+1:]
	tarFile := filepath.Join(dlDir, tarFileName)
	if _, err := httpDownload(tarFile, url, 0644); err != nil {
		return err
	}
	if err := Untar(tarFile, dlDir); err != nil {
		return err
	}
	if _, err := Copyfile(filepath.Join(dlDir, "filebrowser"), filebrowserBin, 0755); err != nil {
		os.RemoveAll(dlDir)
		return err
	}
	os.RemoveAll(dlDir)
	return nil
}

func installAliyundriveWebdav() error {
	expath, _ = os.Getwd()
	dlDir := filepath.Join(expath, "dl")
	fmt.Print(dlDir)
	if _, err := os.Stat(dlDir); err != nil {
		err := os.Mkdir(dlDir, 0777)
		if err != nil {
			return err
		}
	}
	abi := getCachedProperty("ro.product.cpu.abi")
	// abi := "armeabi-v7a"
	abiMap := map[string]string{"armeabi-v7a": "armv7", "arm64-v8a": "aarch64", "x86": "i686", "x86_64": "x86_64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}
	aliyundriveWebdavBin := filepath.Join(expath, "aliyundrive-webdav")
	url, err := getGithubLatestReleaseUrl("messense/aliyundrive-webdav", "[^\"]+aliyundrive-webdav-[^\"]+"+arch+"[^\"]+\\.tar\\.gz")
	if err != nil {
		return err
	}
	fmt.Println("Download: " + url)
	tarFileName := url[strings.LastIndex(url, "/")+1:]
	tarFile := filepath.Join(dlDir, tarFileName)
	if _, err := httpDownload(tarFile, url, 0644); err != nil {
		return err
	}
	if err := Untar(tarFile, dlDir); err != nil {
		return err
	}
	// if err := ExtractRPM(tarFile, dlDir); err != nil {
	// 	return err
	// }
	if _, err := Copyfile(filepath.Join(dlDir, "usr/bin/aliyundrive-webdav"), aliyundriveWebdavBin, 0755); err != nil {
		os.RemoveAll(dlDir)
		return err
	}
	os.RemoveAll(dlDir)
	return nil
}

func checkUiautomatorInstalled() (ok bool) {
	if pi, err := androidutils.StatPackage("com.github.uiautomator"); err == nil {
		fmt.Printf("uiautomator\nversion name:(%s)\nversion code:(%d)",
			pi.Version.Name, pi.Version.Code)
	} else {
		return false
	}
	if pi, err := androidutils.StatPackage("com.github.uiautomator.test"); err == nil {
		fmt.Printf("uiautomator test\nversion name:(%s)\nversion code:(%d)",
			pi.Version.Name, pi.Version.Code)
	} else {
		return false
	}
	return true
}
