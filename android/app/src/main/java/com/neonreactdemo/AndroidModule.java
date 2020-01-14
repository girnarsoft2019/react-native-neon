package com.neonreactdemo;

import android.widget.Toast;

import android.provider.Settings;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;
import javax.annotation.Nullable;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import android.util.Log;
import android.location.Address;
import android.location.Geocoder;

import java.util.List;

import com.facebook.react.bridge.Callback;
import android.content.Context;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;
import android.os.Build;
import android.location.LocationManager;
import android.media.MediaScannerConnection;


public class AndroidModule extends ReactContextBaseJavaModule {
    private ReactContext mReactContext;
    private Context context;

    public AndroidModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AndroidModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        return constants;
    }

    @ReactMethod
    public void scanFile(String filePath) {
        try {
            MediaScannerConnection.scanFile(context,

                    new String[]{filePath}, null,

                    new MediaScannerConnection.OnScanCompletedListener() {

                        public void onScanCompleted(String path, Uri uri) {

                            Log.i("ExternalStorage", "Scanned " + path + ":");

                        }

                    });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void isLocationEnable(final Callback callback) {
        LocationManager locationManager = (LocationManager) getCurrentActivity().getSystemService(context.LOCATION_SERVICE);
        callback.invoke(locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER));
    }

    @ReactMethod
    public void exitApp() {
        getCurrentActivity().finish();
    }

    @ReactMethod
    public void locationSettings() {
        Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
        if (intent.resolveActivity(mReactContext.getPackageManager()) != null) {
            mReactContext.startActivity(intent);
        }
    }


}