import cron from "node-cron";

export const startJob = () => {
  console.log(
    "========================== Midnight Job Registered ========================"
  );
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log(
        "================= ....About to upload Log  ======================="
      );
      //   await _uploadActivityLog();
      console.log(
        `====================== Activity Log Uploaded At ${new Date()} ✅==============`
      );
    } catch (e) {
      console.log(`💣🧨💣🧨💣🧨 Error making Payment: ${e}`);
    }
  });
};
