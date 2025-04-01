import keras

print(keras.utils.image_dataset_from_directory("training_data", 
                                               labels="inferred"))



base_model =  keras.applications.MobileNetV3Small()