import * as ImagePicker from './index';

export var NeonHandler = (function () {
    var neonData;

    function createInstance() {
        return {
            colorPrimary: '#DC592B',
            colorPrimaryDark: '#BA4824',
            maxSize: 0,
            autoConvertPath: false,
            assetType: 'Photos',
            groupTypes: 'All',
            okLabel: 'OK',
            yesLabel: 'Yes',
            cancelLabel: 'Cancel',
            doneLabel: 'Done',
            neutralTitle: 'Neon',
            appName: 'Neon',
            selectTagForAllImages: 'Please select tag for all images.',
            tagNotCovered: 'is not covered',
            backAlertTitle: 'Are you sure want to go back?',
            backAlertMessage: '',
            galleryBackAlertTitle: 'Are you sure want to loose all selected images?',
            galleryBackAlertMessage: '',
            folderRestrictionErrorMsg: 'Not allowed',
            maxSizeChooseAlert: (number) => 'You can only choose ' + number + ' photos at most',
            maxSizeTakeAlert: (number) => 'You can only take ' + number + ' photos at most',
            maxSizeForTagTakeAlert: (tag, number) => 'You can only take ' + number + ' photos for ' + tag,
            initialRoute: undefined,
            libraryMode: ImagePicker.LIBRARY_MODE.HARD,
            sideType: ImagePicker.CAMERA_TYPE.REAR,
            flashMode: ImagePicker.FLASH_MODE.AUTO,
            pictureOptions: {},
            alreadyAddedImages: undefined,
            selectedImages: [],
            tagList: undefined,
            tagEnabled: false,
            flashEnabled: true,
            cameraSwitchEnabled: true,
            callback: undefined,
            showCameraOnNeutral: true,
            showGalleryOnNeutral: true,
            cameraToGallerySwitch: false,
            galleryToCameraSwitch: false,
            cameraOrientation: ImagePicker.ORIENTATION.PORTRAIT,
            folderName: undefined,
            folderRestriction: true,
            quality: 80,
            imageHeight: undefined,
            imageWidth: undefined,
            showTagCoachImage: false,
            showPreviewOnCamera: false,
            locationEnabled: false,
        };
    }

    return {
        initialize: function (data, alreadyAddedImages) {
            neonData = {...createInstance(), ...data};
            if (alreadyAddedImages && alreadyAddedImages instanceof Array) {
                neonData.selectedImages = alreadyAddedImages;
            }
        },
        clearInstance: function () {
            neonData = undefined;
        },
        getOptions: function () {
            if (neonData) {
                return neonData;
            }
            return createInstance();
        },
        changeSelectedImages: function (items) {
            if (neonData) {
                neonData.selectedImages = [...items];
            }
        },
        deleteImageBySubCat: function (subCatId, bankId, index, isAll) {
            if (neonData) {
                neonData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            if (isAll) {
                                child.images = [];
                            } else {
                                let newArray = child.images;
                                newArray.splice(index, 1);
                                child.images = newArray;
                            }

                        }
                    });
                });

            }

        }
    };
})();
