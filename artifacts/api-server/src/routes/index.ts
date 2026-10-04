import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import productsRouter from "./products";
import chatRouter from "./chat";
import paymentsRouter from "./payments";
import flashSalesRouter from "./flash-sales";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(productsRouter);
router.use(chatRouter);
router.use(paymentsRouter);
router.use(flashSalesRouter);

export default router;
