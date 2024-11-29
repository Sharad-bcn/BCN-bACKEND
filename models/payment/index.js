// const mongoose = require('mongoose')
// const { Schema } = mongoose

// const PaymentSchema = new Schema(
//   {
//     fkUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'user',
//       default: null
//     },
//     razorPayOrderId: {
//       type: String,
//       required: true
//     },
//     razorPayPaymentId: {
//       type: String,
//       required: true
//     },
//     razorPaySignature: {
//       type: String,
//       required: true
//     }
//   },
//   { timestamps: true }
// )

// const Payment = mongoose.model('payment', PaymentSchema)
// module.exports = Payment

const mongoose = require('mongoose')
const { Schema } = mongoose

const PaymentSchema = new Schema(
  {
    fkUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null
    },
    razorPayOrderId: {
      type: String,
      required: true
    },
    razorPayPaymentId: {
      type: String,
      required: true
    },
    razorPaySignature: {
      type: String,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

const Payment = mongoose.model('payment', PaymentSchema)
module.exports = Payment
