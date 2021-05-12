import React, { useReducer, useMemo, useContext, FC } from 'react';
import { CartItem } from '../common/types';
import { LegacyCartItem } from './use-cart.types';
import { convertLegacyCartItem } from './utils';

import {
  CartState,
  CartActions,
  CartToggleStates,
  AddToCartFunction,
  ClearCartFunction,
  DecrementItemFunction,
  IncrementItemFunction,
  RemoveFromCartFunction,
  ToggleCartFunction,
  UpdateItemFunction,
  IsInCartFunction,
  StorageTypes
} from './use-cart.types';

import cartReducer, {
  initialState,
  ADD_TO_CART,
  UPDATE_ITEM,
  REMOVE_FROM_CART,
  INCREMENT_ITEM,
  DECREMENT_ITEM,
  TOGGLE_CART,
  CLEAR_CART
} from './use-cart.reducer';

export type CartContextValue = null | CartState;
export type CartActionContextValue = null | CartActions;
export type CartProviderProps = {
  children: JSX.Element | JSX.Element[];
  storage?: StorageTypes;
  cacheKey?: string;
  addToCart?: AddToCartFunction;
  clearCart?: ClearCartFunction;
  decrementItem?: DecrementItemFunction;
  incrementItem?: IncrementItemFunction;
  removeFromCart?: RemoveFromCartFunction;
  toggleCart?: ToggleCartFunction;
  updateItem?: UpdateItemFunction;
  isInCart?: IsInCartFunction;
};

const CartContext = React.createContext<CartContextValue>(null);
const CartActionContext = React.createContext<CartActionContextValue>(null);

export const CartProvider: FC<CartProviderProps> = ({
  children,
  storage = 'local',
  cacheKey = 'cart',
  addToCart,
  clearCart,
  decrementItem,
  incrementItem,
  removeFromCart,
  toggleCart,
  updateItem,
  isInCart
}) => {
  let cart: CartItem[] = [];
  let unformattedCart: CartItem[] | LegacyCartItem[];

  const isClient = typeof window !== 'undefined';

  if (isClient) {
    let cartString: string | null = '';

    if (storage) {
      if (storage === 'local') {
        cartString = window.localStorage.getItem(cacheKey);
      } else if (storage === 'session') {
        cartString = window.sessionStorage.getItem(cacheKey);
      }
    }

    if (cartString) {
      unformattedCart = JSON.parse(cartString);

      const hasLegacyCartItems = unformattedCart?.length
        ? unformattedCart
            .map((i: any) => Boolean(i.productId))
            .some((truthy) => truthy)
        : false;

      if (hasLegacyCartItems) {
        cart = (unformattedCart as LegacyCartItem[]).map((item) =>
          convertLegacyCartItem(item)
        );
      } else {
        cart = unformattedCart as CartItem[];
      }
    }
  }

  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    cart
  });

  const cartActions: CartActions = useMemo(
    () => ({
      addToCart: (payload: CartItem): void =>
        dispatch({
          type: ADD_TO_CART,
          payload,
          isInCart,
          addToCart,
          storage,
          cacheKey
        }),
      removeFromCart: (payload: CartItem) =>
        dispatch({
          type: REMOVE_FROM_CART,
          payload,
          removeFromCart,
          storage,
          cacheKey
        }),
      updateItem: (payload: CartItem) =>
        dispatch({
          type: UPDATE_ITEM,
          payload,
          updateItem,
          storage,
          cacheKey
        }),
      incrementItem: (payload: CartItem): void =>
        dispatch({
          type: INCREMENT_ITEM,
          payload,
          incrementItem,
          storage,
          cacheKey
        }),
      decrementItem: (payload: CartItem): void =>
        dispatch({
          type: DECREMENT_ITEM,
          payload,
          decrementItem,
          storage,
          cacheKey
        }),
      toggleCart: (payload: CartToggleStates) =>
        dispatch({ type: TOGGLE_CART, payload, toggleCart }),
      clearCart: (): void =>
        dispatch({
          type: CLEAR_CART,
          clearCart,
          storage
        })
    }),
    [
      isInCart,
      addToCart,
      removeFromCart,
      updateItem,
      incrementItem,
      decrementItem,
      toggleCart,
      clearCart,
      storage,
      cacheKey
    ]
  );

  return (
    <CartContext.Provider value={state}>
      <CartActionContext.Provider value={cartActions}>
        {children}
      </CartActionContext.Provider>
    </CartContext.Provider>
  );
};

/**
 * Provides access to the cart provider's state
 *
 * @returns an object with the cart's current state
 */
export function useCartState(): CartState | null {
  const context = useContext(CartContext);
  return context;
}

/**
 * Provides access to actions that interact with the cart
 *
 * @returns an object with functions for interacting with the cart.
 *
 * addToCart() - add an item to the cart; if the item is already in the cart,
 * this function will increase the quantity of that item
 * removeFromCart() - remove an item from the cart
 * incrementItem() - increment the quantity of an item in the cart
 * decrementItem() - decrement the quantity of an item in the cart
 * toggleCart() - toggles the cart's show status
 * clearCart() - removes all items from the cart
 */
export function useCartActions(): CartActions | null {
  const context = useContext(CartActionContext);
  return context;
}
