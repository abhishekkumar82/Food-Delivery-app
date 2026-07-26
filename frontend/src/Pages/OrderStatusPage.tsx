import { useGetMyOrders } from '@/api/OrderApi'
import OrderTracker from '@/components/OrderTracker';

const OrderStatusPage = () => {

    const {orders,isLoading}=useGetMyOrders();
    if(isLoading){
        return  "Loading....";
    }

    if(!orders || orders.length===0){
        return "No orders Found";
    }
  return (
    <div  className="space-y-10">
      {orders.map((order)=>(
        <OrderTracker key={order._id} order={order} />
      ))}
    </div>
  )
}

export default OrderStatusPage
