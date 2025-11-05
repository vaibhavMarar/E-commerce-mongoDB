import Cart from "../models/cartModel.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) cart = await Cart.create({ userId: req.user._id, products: [] });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex > -1) cart.products[productIndex].quantity += 1;
    else cart.products.push({ productId });

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("products.productId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("products.productId");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("products.productId");
    if (!cart) {
      return res.json({ userId: req.user._id, products: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
