import axiosClient from "./axiosClient";

const order = {
  // Fetch all orders
  getAllOrder() {
    const url = "/orders";
    return axiosClient.get(url);
  },

  // Create a new order
  createOrder(orderData) {
    const url = "/orders";
    return axiosClient.post(url, orderData);
  },

  // Update an existing order
  updateOrder(orderId, orderData) {
    const url = `/orders/${orderId}`;
    return axiosClient.put(url, orderData);
  },

  // Delete a order
  deleteOrder(orderId) {
    const url = `/orders/${orderId}`;
    return axiosClient.delete(url);
  },

  // Fetch a single order
  getOrder(orderId) {
    const url = `/orders/${orderId}`;
    return axiosClient.get(url);
  },

  paymentByCash(paymentData){
    const url = '/orders/payment'
    return axiosClient.put(url, paymentData)
  },
};

export default order;
