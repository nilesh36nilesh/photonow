import { PictureItem } from "../../global"

export const ADD_PICTURE = "ADD_PICTURE"
export const ADD_TO_BASKET = "ADD_TO_BASKET"
export const REMOVE_FROM_BASKET = "REMOVE_FROM_BASKET"
export const CLEAR_BASKET = "CLEAR_BASKET"

export const addPicture = (picture: PictureItem) => dispatch => {
  dispatch({
    type: ADD_PICTURE,
    payload: picture
  })
}

export const addToBasket = (picture: PictureItem) => dispatch => {
  dispatch({
    type: ADD_TO_BASKET,
    payload: picture
  })
}

export const removeFromBasket = (picture: PictureItem) => dispatch => {
  dispatch({
    type: REMOVE_FROM_BASKET,
    payload: picture
  })
}

export const clearBasket = () => dispatch => {
  dispatch({
    type: CLEAR_BASKET,
    payload: null
  })
}
