import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function TensorDeCoffee() {
  useEffect(() => {
    const run = async () => {
      await tf.ready();
      console.log('✅ TensorFlow מוכן בדפדפן!');

      const user = {
        averageCaffeinePerDay: 360,
        caffeineRecommendationMin: 198,
        caffeineRecommendationMax: 396,
        effects: "physically",
        consumptionTime: ["Morning", "Afternoon"],
        sleepDurationAverage: 9,
        isTryingToReduce: "no",
        isMotivation: true,
        selfDescription: "קפה בשבילי הוא רגע של שקט"
      };

      const input = userToTensorInput(user);
      const xs = tf.tensor2d([
        // דוגמאות לאימון – הכנסי פה עוד משתמשים לפי הצורך
        [500, 200, 400, 1, 4, 5, 0, 1, 0],
        [250, 200, 400, 2, 3, 8, 1, 1, 1],
        [180, 150, 350, 0, 2, 9, 0, 0, 1],
        [390, 200, 396, 3, 4, 6, 0, 1, 0]
      ]);
      const ys = tf.tensor2d([
        [1], // גבוהה מדי
        [0], // תקינה
        [0], // תקינה
        [1]  // גבוהה מדי
      ]);

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, inputShape: [9], activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

      await model.fit(xs, ys, { epochs: 100 });

      const result = model.predict(tf.tensor2d([input], [1, 9]));
      result.print(); // תוצאה בין 0 ל־1
    };

    const userToTensorInput = (user) => {
      const effectsMap = { none: 0, physically: 1, mentally: 2, both: 3 };
      const timeMap = { Morning: 1, Afternoon: 2, evening: 3, night: 4 };

      return [
        user.averageCaffeinePerDay,
        user.caffeineRecommendationMin,
        user.caffeineRecommendationMax,
        effectsMap[user.effects] ?? 0,
        user.consumptionTime?.map(t => timeMap[t]).reduce((a, b) => a + b, 0) ?? 0,
        user.sleepDurationAverage,
        user.isTryingToReduce === "yes" ? 1 : 0,
        user.isMotivation ? 1 : 0,
        user.selfDescription?.includes("שקט") ? 1 : 0
      ];
    };

    run();
  }, []);

  return <h2>🧠 בודק צריכת קפאין עם TensorFlow</h2>;
}
