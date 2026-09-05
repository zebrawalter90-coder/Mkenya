import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import productsRouter from "./products";
import chatRouter from "./chat";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(productsRouter);
router.use(chatRouter);
router.use(paymentsRouter);

export default router;
