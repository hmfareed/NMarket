import { Product } from "@/models/Product";

export interface ReservationItem {
  productId: string;
  quantity: number;
}

/**
 * Atomically reserves inventory using MongoDB $inc.
 * If any product in the cart fails stock check, all preceding reservations are rolled back.
 */
export async function reserveCartStock(
  items: ReservationItem[]
): Promise<{ success: boolean; error?: string; failedProductId?: string }> {
  const reservedItems: ReservationItem[] = [];

  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        "inventory.available": { $gte: item.quantity },
      },
      {
        $inc: {
          "inventory.available": -item.quantity,
          "inventory.reserved": item.quantity,
        },
      },
      { new: true }
    );

    if (!updated) {
      // Rollback already reserved items in reverse order
      console.warn(`[Stock Reservation] Insufficient stock for product ${item.productId}. Rolling back...`);
      for (const rollbackItem of reservedItems) {
        await Product.findByIdAndUpdate(rollbackItem.productId, {
          $inc: {
            "inventory.available": rollbackItem.quantity,
            "inventory.reserved": -rollbackItem.quantity,
          },
        });
      }

      return {
        success: false,
        error: `Insufficient stock for one or more items in your cart. Please adjust quantity.`,
        failedProductId: item.productId,
      };
    }

    reservedItems.push(item);
  }

  return { success: true };
}

/**
 * Releases reserved stock back to available pool upon order cancellation
 */
export async function releaseReservedStock(items: ReservationItem[]): Promise<void> {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        "inventory.available": item.quantity,
        "inventory.reserved": -item.quantity,
      },
    });
  }
}

/**
 * Permanently commits stock upon successful delivery / completion
 */
export async function commitReservedStock(items: ReservationItem[]): Promise<void> {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        "inventory.reserved": -item.quantity,
        "inventory.onHand": -item.quantity,
      },
    });
  }
}
