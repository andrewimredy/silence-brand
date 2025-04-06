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
    shuffle=True
)


#Step 2: Load a base model
base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,  # don’t use the original classifier
    weights="imagenet"
)
base_model.trainable = False  # freeze the pretrained layers

model = keras.Sequential([
    base_model,
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(2, activation='softmax')  # 2 classes: ads or sports
])

#Step 3: Train model on dataset
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(training_set, epochs=5)  # start small, test overfitting


#Step 4: Save model?

model.save("ad_vs_sports_model.h5")

# For inference:
img = prepare_image("training_data/sports/a024eab8-93b3-462a-8729-d9f98752919d.jpg")
prediction = model.predict(img)
print('Predicting Image... ')
print(prediction)
