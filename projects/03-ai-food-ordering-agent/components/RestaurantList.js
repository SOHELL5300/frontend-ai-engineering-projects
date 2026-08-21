import { restaurants } from "@/data/restaurants";
import styles from "./RestaurantList.module.css";

export default function RestaurantList() {
  return (
    <section className={styles.section}>
      <h2>Available Restaurants</h2>

      <div className={styles.grid}>
        {restaurants.map((restaurant) => (
          <article key={restaurant.id} className={styles.card}>
            <div className={styles.image}>{restaurant.image}</div>
            <div>
              <h3>{restaurant.name}</h3>
              <p>{restaurant.cuisine}</p>
              <span>
                ⭐ {restaurant.rating} · {restaurant.deliveryTime}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}