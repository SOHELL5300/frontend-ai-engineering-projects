import CommandBox from "@/components/CommandBox";
import CartPanel from "@/components/CartPanel";
import RestaurantList from "@/components/RestaurantList";
import MenuList from "@/components/MenuList";
import OrderSuccess from "@/components/OrderSuccess";

export default function Home() {
  return (
    <main className="page">
       <div className="pageHeader">
        <p className="eyebrow">
          <span className="pulseDot" /> Frontend AI Engineering Project 3
        </p>
        <h1 className="fadeInUp">Just Say What You're Craving</h1>
        <p className="fadeInUp delay1">
          A voice-enabled AI assistant that converts natural language food
          commands into real cart actions.
        </p>
      </div>

      <div className="layout">
        <div>
          <CommandBox />
          <RestaurantList />
          <MenuList />
        </div>

        <CartPanel />
      </div>

      <OrderSuccess />
    </main>
  );
}