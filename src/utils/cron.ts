import cron from "node-cron";
import { Transaction } from "../models/transaction";
import { Player } from "../models/players";
import { User } from "../models/user";
import uuid from "uuid";
import { Notification } from "../models/notification";

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

        const winAmount = i == 0 ? 20000 : 2000;
        // if user
        user.walletBalance += winAmount;
        await user.save();
        const transaction = Transaction.build({
          user: user?.id,
          amount: 10,
          description: "Won Daily Game",
          type: "CR",
          reference: uuid.v4(),
        });
        const notificaton = Notification.build({
          user: user.id,
          message: `You won ${winAmount} Naira, by coming ${i} Position in todays game.`,
        });
        await notificaton.save();
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
