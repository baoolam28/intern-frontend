/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/xQXp9qNQM4A
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client"

import { useEffect, useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import Menu from "../component/menu"
import productAPI from "../../api/product"
import customerAPI from "../../api/customer"
import orderAPI from "../../api/order"
import inventoryAPI from "../../api/inventory";
import BarcodeScanner from "./barcodeScanner"
import AddCustomerDialog from "../../components/component/addCustomer"
import inventory from "./inventory"
import { useRouter } from 'next/navigation';
import formatVND from "../../utils/formatVND"

export default function sales() {

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [cart, setCart] = useState([]);
  const [splitOrder, setSplitOrder] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const router = useRouter();
  

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProduct();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAllCustomers();
      console.log("Customers:", response); 
      setCustomers(response);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchInventories = async () => {
    try {
      const response = await inventoryAPI.getAllInventory();
      setInventories(response);
        
    } catch (error) {
      console.error("Failed to fetch inventories", error);
    }
  }

  fetchProducts();
  fetchCustomers();
  fetchInventories();
}, []);


  const filteredProducts = useMemo(() => {
  return products.filter((product) => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.price.toString().includes(searchTerm) ||
    product.categoryName.toString().includes(searchTerm) ||
    product.supplierName.toString().includes(searchTerm) ||
    product.originName.toString().includes(searchTerm)
  );
}, [products, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }
  const handleAddToCart = (product) => {
  if (cart.length === 0) {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, { ...product, quantity: 1 }];
      console.log("Cart after adding new product:", updatedCart);
      return updatedCart;
    });
    return;
  }

  const existingProduct = cart.find((item) => item.barcode === product.barcode);

  if (existingProduct) {
    // Cập nhật số lượng của sản phẩm đã có trong giỏ hàng
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.barcode === product.barcode
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      console.log("Cart after updating quantity:", updatedCart);
      return updatedCart;
    });
  } else {
    // Thêm sản phẩm mới vào giỏ hàng
    setCart((prevCart) => {
      const updatedCart = [...prevCart, { ...product, quantity: 1 }];
      console.log("Cart after adding new product:", updatedCart);
      return updatedCart;
    });
  }
};

const handleDecreaseQuantity = (index) => {
  setCart((prevCart) => {
    const updatedCart = [...prevCart];
    const product = updatedCart[index];
    if (product.quantity > 1) {
      updatedCart[index] = { ...product, quantity: product.quantity - 1 };
    } else {
      // Remove the item if quantity is 1 and decrease it
      updatedCart.splice(index, 1);
    }
    console.log("Cart after decreasing quantity:", updatedCart);
    return updatedCart;
  });
};

const handleIncreaseQuantity = (index) => {
  setCart((prevCart) => {
    const updatedCart = [...prevCart];
    const product = updatedCart[index];
    updatedCart[index] = { ...product, quantity: product.quantity + 1 };
    console.log("Cart after increasing quantity:", updatedCart);
    return updatedCart;
  });
};


  const handleRemoveFromCart = (index) => {
      const updatedCart = [...cart]
      updatedCart.splice(index, 1)
      setCart(updatedCart)
  }
  const handleToggleSplitOrder = () => {
    setSplitOrder(!splitOrder)
  }
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
  }
  const handleEditCustomer = (customer) => {}


  const handleValidBarcode = (barcode) => {
    const product = products.find((prod) => prod.barcode === barcode);
    if (product) {
      handleAddToCart(product);
    } else {
      console.error("Product not found:", barcode);
    }
  };

  const handleInvalidBarcode = (barcode) => {
    console.error("Invalid barcode:", barcode);
  };

  const handleCheckout = async () => {
      
      if (cart.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
      }

      if (!selectedCustomer) {
        alert("Vui lòng chọn khách hàng!");
        return;
      }

      const orderData = {
        customerId: selectedCustomer.customerId, // Make sure customer ID is set correctly
        orderDetails: cart.map(product => ({
          quantity: product.quantity,
          price: product.price,
          barcode: product.barcode,
        }))
      };

      // Validate that all fields are filled
      if (!orderData.customerId) {
        alert("Vui lòng chọn khách hàng hợp lệ!");
        return;
      }

      if (orderData.orderDetails.length === 0) {
        alert("Không có sản phẩm nào trong đơn hàng!");
        return;
      }

      const invalidDetails = orderData.orderDetails.some(detail =>
        !detail.quantity || !detail.price || !detail.barcode
      );

      if (invalidDetails) {
        alert("Đơn hàng có thông tin sản phẩm không hợp lệ!");
        return;
      }


      
      try {
        const order = await orderAPI.createOrder(orderData);

        if (order) {
          setCart([]);
          setSelectedCustomer(null);
          // Use await to ensure the router.push is executed after the order is created
          await router.push(`/payment?orderId=${order.orderId}`);
        }
      } catch (error) {
        console.error("Error during checkout:", error);
        alert("Đã xảy ra lỗi khi thực hiện thanh toán. Vui lòng thử lại.");
      }

  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const response = customerAPI.createCustomer(customerData);
      setCustomers((prev) => [prev, response]);
      console.log(response);
    } catch (error) {
      console.log('create customer error: ', error);
    }
  }

  const handleCancel = () => {
    setCart([]);
    setSelectedCustomer(null);
  };



  return (
    (<div className="flex min-h-screen w-full bg-muted/40">
      <Menu/>
      <BarcodeScanner 
      onValidBarcode={handleValidBarcode}
      onInvalidBarcode={handleInvalidBarcode} 
    />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full" />
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <BarcodeIcon className="h-6 w-6" />
            <span className="sr-only">Scan Barcode</span>
          </Button>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {
            filteredProducts.map((product) => (
              <Card key={product.barcode} className="group">
                {/* <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
                  <span className="sr-only">View product</span>
                </Link> */}
                <div className="relative">
                  <img
                    src="/placeholder.svg"
                    alt={product.name}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full aspect-square group-hover:opacity-50 transition-opacity" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => handleAddToCart(product)}>
                    <PlusIcon className="h-5 w-5" />
                    <span className="sr-only">Add to cart</span>
                  </Button>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <div className="flex flex-row justify-between">
                    <h3 className="font-medium">{product.productName}</h3>
                    <span className="font-medium">
                      Tồn kho:  
                      {inventories.map((inventory) => inventory.barcode === product.barcode ? inventory.quantityInStock : 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">{formatVND(product.price.toFixed(2))} </span>
                    <span className="text-xs text-muted-foreground">{product.barcode}</span>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
      <div className="w-150 bg-muted p-8 border-l">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Cart</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleToggleSplitOrder}>
              {splitOrder ? <LayersIcon className="h-5 w-5" /> : <LayersIcon className="h-5 w-5" />}
              <span className="sr-only">Split order</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <PrinterIcon className="h-5 w-5" />
              <span className="sr-only">Print receipt</span>
            </Button>
          </div>
        </div>
        {cart.length > 0 ? (
          <div className="grid gap-4">
            {cart.map((product, index) => (
              <div
                key={product.id}
                className="grid grid-cols-[50px_1fr_50px] items-center gap-4">
                <img
                  src="/placeholder.svg"
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded-lg object-cover"
                  style={{ aspectRatio: "50/50", objectFit: "cover" }} />
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="text-sm text-muted-foreground">{formatVND(product.price.toFixed(2))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleDecreaseQuantity(index)}>
                    <MinusIcon className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span>{product.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleIncreaseQuantity(index)}>
                    <PlusIcon className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleRemoveFromCart(index)}>
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Remove from cart</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Giỏ hàng đang trống.</p>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Tổng:</span>
            <span className="font-medium">{formatVND(cart.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2))}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Thuế:</span>
            <span className="font-medium">0.00đ</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-medium">Tổng cộng:</span>
            <span className="text-lg font-medium">
              {formatVND(cart.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2))}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Button  onClick={handleOpenDialog}>Thêm khách hàng</Button>
            </div>
            <AddCustomerDialog
                      open={dialogOpen}
                      onClose={handleCloseDialog}
                      onSave={handleSaveCustomer}
                      buttonText=""
                      buttonIcon={""}
                      hidden
                    />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  {selectedCustomer ? selectedCustomer.name : "Select customer"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {customers.map((customer) => (
                  <DropdownMenuItem key={customer.customerId} onClick={() => handleSelectCustomer(customer)}>
                    {customer.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem >
                  
                  
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
          {selectedCustomer && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{selectedCustomer.phone}</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleCheckout}>Checkout</Button>
        </div>
      </div>
    </div>)
  );
}

function BarcodeIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M3 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>)
  );
}


function ChevronDownIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>)
  );
}


function LayersIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path
        d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>)
  );
}


function MinusIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>)
  );
}


function PlusIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>)
  );
}


function PrinterIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path
        d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>)
  );
}


function SearchIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>)
  );
}


function ShoppingCartIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path
        d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>)
  );
}


function XIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>)
  );
}
