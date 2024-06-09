import cron from "node-cron";
import { Transaction } from "../models/transaction";
import { Player } from "../models/players";
import { User } from "../models/user";
import uuid from "uuid";

export const startJob = () => {
  console.log(
    "========================== Midnight Job Registered ========================"
  );
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log(
        "================= ....About to Credit Winners Wallets  ======================="
      );
      const today = new Date();
      today.setDate(today.getDate() - 1);
      today.setHours(0, 0, 0, 0);

      const today_winners = await Player.find({
        started_at: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      });

      for (let i = 0; i < 10; i++) {
        const winner = today_winners[i];

        const user = await User.findById(winner.user);
        if (!user) {
          console.log("could not find user with ID::", winner.user);
          return;
        }
        user.walletBalance += 10;
        await user.save();
        const transaction = Transaction.build({
          user: user?.id,
          amount: 10,
          description: "Won Daily Game",
          type: "CR",
          reference: uuid.v4(),
        });
        await transaction.save();
      }

      console.log(
        `====================== All Winners Wallet Credited At ${new Date()} ✅==============`
      );
    } catch (e) {
      console.log(`💣🧨💣🧨💣🧨 Error making Payment: ${e}`);
    }
  });
};
