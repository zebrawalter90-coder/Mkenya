import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import productsRouter from "./products";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(productsRouter);
router.use(chatRouter);

export default router;
