package fr.bamlab.rnimageresizer;

import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.AsyncTask;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.GuardedAsyncTask;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import android.media.ExifInterface;

/**
 * Created by almouro on 19/11/15.
 * Updated by Cristiano on 2019-05-12
 */
public class ImageResizerModule extends ReactContextBaseJavaModule {
    private Context context;

    public ImageResizerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from javascript.
     */
    @Override
    public String getName() {
        return "ImageResizerAndroid";
    }

    @ReactMethod
    public void createResizedImage(final String imagePath, final int newWidth, final int newHeight, final String compressFormat, final int quality, final String appName, final int rotation, final String outputPath, final Callback successCb, final Callback failureCb) {

        // Run in guarded async task to prevent blocking the React bridge
        new GuardedAsyncTask<Void, Void>(getReactApplicationContext()) {
            @Override
            protected void doInBackgroundGuarded(Void... params) {
                try {
                    createResizedImageWithExceptions(imagePath, newWidth, newHeight, compressFormat, quality, appName, rotation, outputPath, successCb, failureCb);
                }
                catch (IOException e) {
                    failureCb.invoke(e.getMessage());
                }
            }
        }.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    private void createResizedImageWithExceptions(String imagePath, int newWidth, int newHeight,
                                           String compressFormatString, int quality, String appName, int rotation, String outputPath,
                                           final Callback successCb, final Callback failureCb) throws IOException {

        Bitmap.CompressFormat compressFormat = Bitmap.CompressFormat.valueOf(compressFormatString);
        Uri imageUri = Uri.parse(imagePath);

        Bitmap scaledImage = ImageResizer.createResizedImage(this.context, imageUri, newWidth, newHeight, quality, rotation);

        if (scaledImage == null) {
          throw new IOException("The image failed to be resized; invalid Bitmap result.");
        }

        // Save the resulting image
        File path = context.getCacheDir();
        if (outputPath != null) {
            path = new File(outputPath);
        }

        File resizedImage = ImageResizer.saveImage(scaledImage, path, Long.toString(new Date().getTime()), compressFormat, quality);

        if(appName != null && resizedImage.isFile()){
            ExifInterface ei = new ExifInterface(resizedImage.getAbsolutePath());
            ei.setAttribute(ExifInterface.TAG_MAKE, appName);
            ei.saveAttributes();
        }
        // If resizedImagePath is empty and this wasn't caught earlier, throw.
        if (resizedImage.isFile()) {
            WritableMap response = Arguments.createMap();
            response.putString("path", resizedImage.getAbsolutePath());
            response.putString("uri", Uri.fromFile(resizedImage).toString());
            response.putString("name", resizedImage.getName());
            response.putDouble("size", resizedImage.length());
            response.putDouble("width", scaledImage.getWidth());
            response.putDouble("height", scaledImage.getHeight());
            // Invoke success
            successCb.invoke(response);
        } else {
            failureCb.invoke("Error getting resized image path");
        }


        // Clean up bitmap
        scaledImage.recycle();
    }
}
