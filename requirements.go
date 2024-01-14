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
	appDebug := filepath.Join(tmpPath, "app-uiautomator.apk")
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

	appDebugTest := filepath.Join(tmpPath, "app-uiautomator-test.apk")
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
	if fileExists(minicapBin) && fileExists(minicapSo) {
		return nil
	}
	if runtime.GOOS == "windows" {
		return nil
	}
	log.Println("install minicap")
	if fileExists(minicapBin) && fileExists(minicapSo) {
		if err := Screenshot("/dev/null", ""); err != nil {
			log.Println("err:", err)
		} else {
			return nil
		}
	}
	// remove first to prevent "text file busy"
	os.Remove(minicapBin)
	os.Remove(minicapSo)

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
	// binURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/" + abi + "/minicap"
	// binURL := strings.Join([]string{minicapSource, abi, "bin", "minicap"}, "/")
	binURL := "https://github.com/bbsvip/minicap_minitouch_prebuilt/raw/main/minicap/" + abi + "/bin/minicap"
	_, err := httpDownload(minicapBin, binURL, 0755)
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
	// libURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/minicap-shared/aosp/libs/android-" + sdk + "/" + abi + "/minicap.so"
	//libURL := strings.Join([]string{minicapSource, abi, "lib", "android-" + sdk, "minicap.so"}, "/")
	soUrl := "https://github.com/bbsvip/minicap_minitouch_prebuilt/raw/main/minicap/" + abi + "/lib/android-" + sdk + "/minicap.so"
	_, err = httpDownload(minicapSo, soUrl, 0644)
	if err != nil {
		return err
	}
	return nil
}

func installMinitouch() error {
	if fileExists(minitouchBin) {
		return nil
	}
	abi := getCachedProperty("ro.product.cpu.abi")
	// binURL := formatString("http://{baseurl}/{path}/{abi}/{bin}", map[string]string{
	// 	"baseurl": baseurl,
	// 	"path":    "stf-binaries/node_modules/@devicefarmer/minitouch-prebuilt/prebuilt",
	// 	"abi":     abi,
	// 	"bin":     "bin/minitouch",
	// })
	// binURL := "https://github.com/AirtestProject/Airtest/raw/master/airtest/core/android/static/stf_libs/" + getCachedProperty("ro.product.cpu.abi") + "/minitouch"
	url := "https://github.com/bbsvip/minicap_minitouch_prebuilt/raw/main/minitouch/" + abi + "/bin/minitouch"
	_, err := httpDownload(minitouchBin, url, 0755)
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
		if _, err := httpDownload(filepath.Join(tmpPath, "sl4a.apk"), sl4aApkUrl, 0644); err != nil {
			return err
		}
		if err := forceInstallAPK(filepath.Join(tmpPath, "sl4a.apk")); err != nil {
			return err
		}
	}
	if pi, err := androidutils.StatPackage("com.googlecode.pythonforandroid"); err == nil {
		fmt.Printf("Python For Android\nversion name:(%s)\nversion code:(%d)\n", pi.Version.Name, pi.Version.Code)
	} else {
		pythonforandroidApkUrl := "https://github.com/kuri65536/python-for-android/releases/download/r32/Python3ForAndroid-debug.apk"
		if _, err := httpDownload(filepath.Join(tmpPath, "python_for_android.apk"), pythonforandroidApkUrl, 0644); err != nil {
			return err
		}
		if err := forceInstallAPK(filepath.Join(tmpPath, "python_for_android.apk")); err != nil {
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
	abi := getCachedProperty("ro.product.cpu.abi")
	abiMap := map[string]string{"armeabi-v7a": "armv7", "arm64-v8a": "arm64", "x86": "386", "x86_64": "amd64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}
	url, err := getGithubLatestReleaseUrl("filebrowser/filebrowser", "[^\"]+linux-"+arch+"[^\"]+")
	if err != nil {
		return err
	}
	fmt.Println("Download: " + url)
	tarFileName := url[strings.LastIndex(url, "/")+1:]
	tarFile := filepath.Join(tmpPath, tarFileName)
	if _, err := httpDownload(tarFile, url, 0644); err != nil {
		return err
	}
	if err := Untar(tarFile, tmpPath); err != nil {
		return err
	}
	if _, err := Copyfile(filepath.Join(tmpPath, "filebrowser"), filebrowserBin, 0755); err != nil {
		os.RemoveAll(tarFile)
		return err
	}
	os.RemoveAll(tarFile)
	return nil
}

func installBusybox() error {
	abi := getCachedProperty("ro.product.cpu.abi")
	abiMap := map[string]string{"armeabi-v7a": "armv7l", "armv8l": "aarch64", "x86": "i686", "x86_64": "x86_64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}
	url := "https://busybox.net/downloads/binaries/1.31.0-defconfig-multiarch-musl/busybox-" + arch
	// log.Println(url)
	// log.Println(busyboxBin)
	if _, err := httpDownload(busyboxBin, url, 0755); err != nil {
		log.Println(err)
		return err
	}
	return nil
}

func installCurl() error {
	abi := getCachedProperty("ro.product.cpu.abi")
	abiMap := map[string]string{"armeabi-v7a": "armv7", "armv8l": "aarch64", "x86": "i386", "x86_64": "amd64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}
	url, err := getGithubLatestReleaseUrl("moparisthebest/static-curl", "[^\"]+/curl-"+arch)
	fmt.Println("Download: " + url)
	if err != nil {
		return err
	}
	if _, err := httpDownload(curlBin, url, 0755); err != nil {
		return err
	}
	return nil
}

func installAlist() error {
	if _, err := os.Stat(tmpPath); err != nil {
		err := os.Mkdir(tmpPath, 0777)
		if err != nil {
			return err
		}
	}
	abi := getCachedProperty("ro.product.cpu.abi")
	abiMap := map[string]string{"armeabi-v7a": "musleabi-armv7m", "armv8l": "musl-arm64	", "x86": "386", "x86_64": "musl-amd64"}
	arch, ok := abiMap[abi]
	if !ok {
		return errors.New("math: square root of negative number")
	}

	url, err := getGithubLatestReleaseUrl("alist-org/alist", "[^\"]+/alist-linux-"+arch+"\\.tar\\.gz")
	fmt.Println("Download: " + url)
	if err != nil {
		return err
	}
	tarFileName := url[strings.LastIndex(url, "/")+1:]
	tarFile := filepath.Join(tmpPath, tarFileName)
	if _, err := httpDownload(tarFile, url, 0644); err != nil {
		return err
	}
	if err := Untar(tarFile, binPath); err != nil {
		return err
	}
	// if _, err := Copyfile(filepath.Join(tmpPath, "alist"), filebrowserBin, 0755); err != nil {
	// 	os.RemoveAll(tmpPath)
	// 	return err
	// }
	os.RemoveAll(tarFile)
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
