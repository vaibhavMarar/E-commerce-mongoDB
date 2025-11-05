import express from "express";
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/remove", protect, removeFromCart);

export default router;
