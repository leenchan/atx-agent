import android
import sys
import time

droid = android.Android()

try:
	act = droid.getIntent().result[u'extras'][u'activity']
	args = []
	print("Start")
	for val in ['arg1', 'arg2', 'arg3', 'arg4', 'arg5']:
		if val in droid.getIntent().result[u'extras']:
			args.append(droid.getIntent().result[u'extras'][val])
	activity = getattr(droid, act)
	activity(*args)
except:
	print("Error!")
	droid.makeToast('please pass -e activity XXXX -e arg1 XXXX -e arg2 XXXX...')

# sys.exit(1)

