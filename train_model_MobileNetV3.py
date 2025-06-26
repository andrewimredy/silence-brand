import keras
import tensorflow as tf

#take a screenshot, load as a tensor and downscale
def prepare_image(filename: str, target_size=224) -> tf.Tensor:
    img = tf.io.read_file(filename)
    img = tf.io.decode_jpeg(img, channels=3)
    img = tf.image.convert_image_dtype(img, tf.float32)
    img = tf.image.resize_with_pad(img, target_size, target_size)
    img = tf.expand_dims(img, axis=0)
    return img



#Step 1: Get dataset, in directory training_data/ads and training_data/sports
training_set = keras.utils.image_dataset_from_directory(
    "training_data",
    image_size=(224, 224),
    batch_size=32,
    label_mode="categorical",
    validation_split=0.2,
    subset="training",
    seed=123,
    shuffle=True
)
print(training_set.class_names)  # Just to verify
validation_set = keras.utils.image_dataset_from_directory(
    "training_data",
    image_size=(224, 224),
    batch_size=32,
    label_mode="categorical",
    validation_split=0.2,
    subset="validation",
    seed=123,
    shuffle=True
)



#Step 2: Load a base model
base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,  # don’t use the original classifier
    weights="imagenet"
)
base_model.trainable = False  # freeze the pretrained layers

data_augmentation = keras.Sequential([
    keras.layers.RandomFlip("horizontal"),
    keras.layers.RandomRotation(0.05),
    keras.layers.RandomZoom(0.1),
    keras.layers.RandomContrast(0.1)
])

model = keras.Sequential([
    data_augmentation,
    base_model,
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(2, activation='softmax')
])



#Step 3: Train model on dataset
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(training_set, validation_data=validation_set, epochs=5)  


#Step 4: Save model?

model.save("ad_vs_sports_model.h5")

# For inference:
img = prepare_image("training_data/sports/4f491543-8b9b-40b5-a9b7-531dd23a8bfe.jpg")
prediction = model.predict(img)
print('Predicting Image... ')
print(training_set.class_names)
print(prediction)
