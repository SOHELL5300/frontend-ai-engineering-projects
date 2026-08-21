import { restaurants } from "@/data/restaurants";
import styles from "./MenuList.module.css";
import { formatCurrency } from "@/utils/formatCurrency";

export default function MenuList() {
  return (
    <section className={styles.section}>
      <h2>Menu Dataset</h2>
      <p className={styles.description}>
        These are the mock menu items AI can match against.
      </p>

      <div className={styles.restaurantMenus}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className={styles.menuBlock}>
            <h3>{restaurant.name}</h3>

            {restaurant.menu.map((item) => (
              <div key={item.id} className={styles.menuItem}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.category}</p>
                </div>
                <span>{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}