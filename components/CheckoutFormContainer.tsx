import React, { FunctionComponent } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { Grid, Box, CircularProgress, Typography } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import { injectStripe, ReactStripeElements } from "react-stripe-elements"
import { connect, DispatchProp } from "react-redux"
import { FormState } from "redux-form"
import { AppState, PictureItem } from "../global"
import ErrorIcon from "@material-ui/icons/Error"

import { CheckoutForm } from "../components/CheckoutForm"
import { Banner } from "../components/Banner"
import * as server from "../utils/server"
import { actions } from "../store"

const StripePaymentButton = dynamic(
  import("./StripePaymentButton").then(instance => instance.StripePaymentButton),
  {
    ssr: false
  }
)

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    margin: theme.spacing(2)
  }
}))

interface CheckoutFormContainerProps {
  checkoutForm: FormState
  pictures: PictureItem[]
}

const CheckoutFormContainer: FunctionComponent<
  ReactStripeElements.InjectedStripeProps & CheckoutFormContainerProps & DispatchProp<any>
> = ({ stripe, checkoutForm, pictures, dispatch }) => {
  const [loaded, setLoaded] = React.useState(false)
  const [paymentStatus, setPaymentStatus] = React.useState({
    paymentAttemptMade: false,
    success: false,
    message: ""
  })
  const [success, setSuccess] = React.useState(false)

  const classes = useStyles({})
  const router = useRouter()

  const getOrderDetails = async (): Promise<stripe.PaymentIntentResponse> => {
    return await stripe.handleCardPayment(router.query.token as string, {
      receipt_email: checkoutForm.values.emailAddress,
      payment_method_data: {
        billing_details: {
          email: checkoutForm.values.emailAddress,
          name: checkoutForm.values.cardName,
          address: {
            line1: checkoutForm.values.address1,
            line2: checkoutForm.values.address2,
            city: checkoutForm.values.city,
            state: checkoutForm.values.state,
            postal_code: checkoutForm.values.postalCode,
            country: checkoutForm.values.country
          }
        }
      }
    })
  }

  const handleOrder = async (
    paymentIntent: stripe.paymentIntents.PaymentIntent,
    error?: stripe.Error
  ) => {
    if (error) {
      setPaymentStatus({ paymentAttemptMade: true, success: false, message: error.message })
      window.scrollTo(0, 0)
      return
    }

    const { success, data } = await server.postAsync<string>("/stripe/check-order", {
      paymentIntentId: paymentIntent.id
    })

    debugger

    setPaymentStatus({ paymentAttemptMade: true, success, message: "" })

    if (success) {
      dispatch(actions.pictures.clearBasket())
      router.push(data)
      return
    } else {
      window.scrollTo(0, 0)
    }
  }

  return (
    <>
      <Box mb={5}>
        <StripePaymentButton
          orderTotal={pictures
            .filter(picture => picture.addedToBasket)
            .reduce((acc, current) => (acc += current.price), 0)}
          stripe={stripe}
          handleOrder={handleOrder}
          loaded={success => {
            setLoaded(true)
            setSuccess(success)
          }}
        />
      </Box>
      {paymentStatus.paymentAttemptMade && !paymentStatus.success && (
        <Banner
          theme="error"
          icon={<ErrorIcon />}
          message={
            <Typography>
              Your payment was not successful. Please check your details and try again.
              <br />
              {paymentStatus.message}
            </Typography>
          }
        />
      )}
      {loaded && (
        <CheckoutForm
          onSubmit={async () => {
            const { paymentIntent, error } = await getOrderDetails()
            await handleOrder(paymentIntent, error)
          }}
        />
      )}
      {!loaded && (
        <Grid container justify="center" alignItems="center">
          <Grid item>
            <CircularProgress className={classes.progress} />
          </Grid>
        </Grid>
      )}
    </>
  )
}

const ConnectedCheckoutFormContainer = connect((state: AppState) => ({
  pictures: state.pictures,
  checkoutForm: state.form.checkoutForm
}))(CheckoutFormContainer)

const InjectedCheckoutFormContainer = injectStripe(ConnectedCheckoutFormContainer)

export { InjectedCheckoutFormContainer as CheckoutFormContainer }
