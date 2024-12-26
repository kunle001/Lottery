import { Router } from "express";
import { ViewController } from "../controllers/veiw.controller";
import { requireAuth } from "../middlewares/current_user";

const router = Router();
const veiwController = new ViewController();

router.use(requireAuth);
router.get("/inc/:id", veiwController.AddView);

export { router as ViewRouter };
