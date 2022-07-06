#!/system/bin/sh
CUR_DIR=$(cd "$(dirname "$0" 2>/dev/null)";pwd)
[ -z "$api" ] && api=$(getprop ro.build.version.sdk)

# android.Android() will launch SL4A server, if server down.

PW=`pwd`
if [ -d "/data/data/com.googlecode.python3forandroid" ]; then
  PYTHON_VERSION="3.6"
  PYTHON_PACKAGE_NAME="com.googlecode.python3forandroid"
  PYTHON_BIN_NAME="python3"
elif [ -d "/data/data/com.googlecode.pythonforandroid" ]; then
  PYTHON_VERSION="2.7"
  PYTHON_PACKAGE_NAME="com.googlecode.pythonforandroid"
  PYTHON_BIN_NAME="python"
else
  echo "Please install PythonForAndroid first of all." >&2
  exit 1
fi

PYTHON_ROOT_DIR="/data/data/${PYTHON_PACKAGE_NAME}/files/${PYTHON_BIN_NAME}"
PYTHON_BIN_DIR="$PYTHON_ROOT_DIR/bin"
PYTHON_LIB_DIR="$PYTHON_ROOT_DIR/lib"
PYTHON_BIN="$PYTHON_BIN_DIR/${PYTHON_BIN_NAME}"

export EXTERNAL_STORAGE=$(for i in /mnt/storage /mnt/sdcard /sdcard; do [ -d $i ] && echo $i && break; done)
export LANG=en
PYTHON_EXTRAS_DIR="$EXTERNAL_STORAGE/${PYTHON_PACKAGE_NAME}/extras/$PYTHON_BIN_NAME"
# normal (pure python modules only)
PYTHONUSERBASE="$EXTERNAL_STORAGE/${PYTHON_PACKAGE_NAME}/local"
# to use C extension modules (with shared lib)
# PYTHONUSERBASE=/data/local/tmp/local
PYTHONPATH="$PYTHON_EXTRAS_DIR"
PYTHONPATH="${PYTHONPATH}:$PYTHONUSERBASE"
PYTHONPATH="${PYTHONPATH}:$PYTHON_LIB_DIR/python${PYTHON_VERSION}/lib-dynload"
export PYTHONPATH
export PYTHONUSERBASE
export TEMP=$PYTHON_EXTRAS_DIR/tmp
export PYTHON_EGG_CACHE=$TEMP
# do not use this for Python3.4, see issue tracker.
export PYTHONHOME=$PYTHON_EXTRAS_DIR:$PYTHON_ROOT_DIR
export LD_LIBRARY_PATH=$PYTHON_LIB_DIR

if [ "$api" -lt 14 ]; then
  RUN_PIE=/data/data/com.googlecode.android_scripting/files/run_pie
  if ! [ -x $RUN_PIE ]; then
    echo "need root permission to launch run_pie/python"
    ls -l "$RUN_PIE"
    # su -c "chmod 755 $run"
    su -c "$RUN_PIE $PYTHON_BIN \"$@\""
  else
    $RUN_PIE $PYTHON_BIN "$@"
  fi
else
  $PYTHON_BIN "$@"
fi

