import {RNCamera} from 'react-native-camera';

export var NeonHandler = (function () {
    var docData;

    function createInstance() {
        return {
            maxSize: 1,
            autoConvertPath: false,
            assetType: 'Photos',
            groupTypes: 'All',
            okLabel: 'OK',
            cancelLabel: 'Cancel',
            deleteLabel: 'Delete',
            useVideoLabel: 'Use Video',
            usePhotoLabel: 'Use Photo',
            previewLabel: 'Preview',
            choosePhotoTitle: 'Choose Photo',
            maxSizeChooseAlert: (number) => 'You can only choose ' + number + ' photos at most',
            maxSizeTakeAlert: (number) => 'You can only take ' + number + ' photos at most',
            supportedOrientations: ['portrait', 'landscape'],
            sideType: RNCamera.Constants.Type.back,
            flashMode: 0,
            videoQuality: RNCamera.Constants.VideoQuality["480p"],
            pictureOptions: {},
            recordingOptions: {},
            selectedImages: [],
            tagList: undefined,
            tagEnabled: false,
            isVideo: true,
            flashEnabled: true,
            cameraSwitchEnabled: true,
            resultRoute: undefined,
            callback: undefined,
            showCameraOnNeutral: true,
            showGalleryOnNeutral: true
        };
    }

    return {
        initialize: function (data) {
            docData = {...createInstance(), ...data};
        },
        clearInstance: function () {
            docData = createInstance();
        },
        getOptions: function () {
            if (docData)
                return docData;
            return [];
        },
        deleteImageBySubCat: function (subCatId, bankId, index, isAll) {
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            if (isAll) {
                                child.images = []
                            } else {
                                let newArray = child.images;
                                newArray.splice(index, 1);
                                child.images = newArray;
                            }

                        }
                    })
                })

            }

        },
        deleteImageByServerId: function (catId, subCatId, serverId) {
            if (docData) {

            }
        },
        getImagesToReview: function (subCatId, bankId) {
            let imageToReview = [];
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            imageToReview = child.images;
                        }
                    })
                })
            }
            return imageToReview;
        },
        addMoreImage: function (subCatId, bankId, imageArray, index) {
            Utility.log('index : ' + index);
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            if (index === child.images.length) {
                                imageArray.forEach((item) => {
                                    child.images.push(item);
                                })
                            } else {
                                let i = index;
                                for (let j = 0; j < imageArray.length; j++) {
                                    child.images.splice(i, 0, imageArray[j]);
                                    i++;
                                }


                            }
                        }
                    })
                })
            }

        },
        insertImages: function (subCatId, bankId, imageArray) {
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            child.images = imageArray;
                        }
                    })
                })
            }
        },

        reuploadImages: function (subCatId, bankId, imageArray, index, isAll) {
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            if (isAll) {
                                child.images = imageArray;
                            } else {
                                let i = index;
                                if ((child.images.length - 1) === i) {
                                    for (let j = 0; j < imageArray.length; j++) {
                                        if (j === 0) {
                                            child.images.splice(i, 1, imageArray[j]);
                                        } else {
                                            child.images.push(imageArray[j])
                                        }
                                    }
                                } else {
                                    for (let j = 0; j < imageArray.length; j++) {
                                        if (j === 0) {
                                            child.images.splice(i, 1, imageArray[j]);
                                        } else {
                                            child.images.splice(i, 0, imageArray[j]);
                                        }
                                        i++;
                                    }
                                }
                            }
                        }
                    })
                })
            }

        },
        updateImageById(imageId, serverImageId, imageUrl) {
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        child.images.forEach((image) => {
                            if (image.id === imageId) {
                                image.id = serverImageId;
                                image.path = imageUrl;
                                image.incorrect = 0;
                                if(image.doc_remarks){
                                    image.doc_remarks = '';
                                }
                            }
                        })
                    })
                })
            }
        },
        getIdsToDelete(subCatId, bankId, index, isAll) {
            let ids = '';
            if (docData) {
                docData.forEach((data) => {
                    data.child.forEach((child) => {
                        if (child.id === subCatId && child.bank_id === bankId) {
                            if (isAll) {
                                for (let i = 0; i < child.images.length; i++) {
                                    if (i === (child.images.length - 1)) {
                                        ids = ids + child.images[i].id
                                    } else {
                                        ids = ids + child.images[i].id + ','
                                    }
                                }
                            } else {
                                ids = ids + child.images[index].id;
                            }

                        }
                    })
                })

            }
            return ids;
        }
    };
})();
