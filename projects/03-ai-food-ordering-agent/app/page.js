import CommandBox from "@/components/CommandBox";
import CartPanel from "@/components/CartPanel";
import RestaurantList from "@/components/RestaurantList";
import MenuList from "@/components/MenuList";
import OrderSuccess from "@/components/OrderSuccess";

export default function Home() {
  return (
    <main className="page">
      <div className="pageHeader">
        <p className="eyebrow">Frontend AI Engineering Project 3</p>
        <h1>AI Food Ordering Agent</h1>
        <p>
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