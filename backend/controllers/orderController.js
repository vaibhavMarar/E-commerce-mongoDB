import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

export const placeOrder = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate("products.productId");
  const totalPrice = cart.products.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);

  const order = await Order.create({
    userId: req.user.id,
    products: cart.products,
    totalPrice,
  });

  cart.products = [];
  await cart.save();

  res.json(order);
};
