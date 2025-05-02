import '@tensorflow/tfjs-react-native';

export async function analyzeInitialPattern(user) {
  await tf.ready();

  const input = [
    user.age ?? 0,
    user.averageCaffeinePerDay ?? 0,
    user.sleepDurationAverage ?? 0,
    user.workDurationAverage ?? 0,
    user.caffeineRecommendationMin ?? 0,
    user.caffeineRecommendationMax ?? 0,
    user.isTryingToReduce ? 1 : 0,
    user.isMotivation ? 1 : 0,
    (user.selfDescription || "").includes("שקט") ? 1 : 0,
    (user.selfDescription || "").includes("להתעורר") ? 1 : 0,
    user.activityLevel === "High" ? 1 : 0
  ];
  

  // ⚠ כאן נתוני אימון צריכים להיות באותו מבנה: 11 עמודות
  const xs = tf.tensor2d([
    [22, 360, 6, 8, 200, 400, 0, 1, 1, 0, 1],
    [30, 250, 8, 10, 250, 400, 1, 1, 0, 1, 1],
    [26, 180, 7, 6, 180, 360, 0, 0, 1, 0, 0],
    [34, 400, 5, 12, 300, 500, 0, 1, 0, 0, 1]
  ]);
  const ys = tf.tensor2d([
    [1],
    [0],
    [0],
    [1]
  ]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, inputShape: [11], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

  await model.fit(xs, ys, { epochs: 100 });

  const prediction = model.predict(tf.tensor2d([input], [1, 11]));
  const score = prediction.dataSync()[0];

  return score > 0.7
    ? "⚠️ דפוס ההתנהגות שלך מצריך תשומת לב – שקול/י להפחית קפאין ולשפר את השינה."
    : "✅ דפוס ההתנהגות שלך נראה מאוזן – כל הכבוד!";
}
