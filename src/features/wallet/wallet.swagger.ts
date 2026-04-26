/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet and payment management
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user wallet
 *     description: Retrieve authenticated user's wallet information including balance and escrow balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     escrowBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     description: Retrieve paginated transaction history for authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of transactions per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           walletId:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [DEPOSIT, ESCROW_LOCK, PAYOUT, COMMISSION, REFUND]
 *                           status:
 *                             type: string
 *                             enum: [PENDING, SUCCESS, FAILED]
 *                           referenceId:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                             properties:
 *                               description:
 *                                 type: string
 *                               feeApplied:
 *                                 type: number
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wallet/deposit/initialize:
 *   post:
 *     summary: Initialize deposit
 *     description: Initialize a deposit transaction via Paystack using enhanced SDK integration
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Deposit amount in NGN
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Deposit initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                     reference:
 *                       type: string
 *                     access_code:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wallet/deposit/verify/{reference}:
 *   get:
 *     summary: Verify payment status
 *     description: Verify the status of a Paystack payment using the reference
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *         example: DEP_1714567890_abc123_456789
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     reference:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paid_at:
 *                       type: string
 *                     customer:
 *                       type: object
 *       400:
 *         description: Invalid reference
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/wallet/transaction/{transactionId}:
 *   get:
 *     summary: Get transaction status
 *     description: Retrieve the status and details of a specific wallet transaction
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet transaction ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     walletId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                       enum: [DEPOSIT, ESCROW_LOCK, PAYOUT, COMMISSION, REFUND]
 *                     status:
 *                       type: string
 *                       enum: [PENDING, SUCCESS, FAILED]
 *                     referenceId:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid transaction ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /api/wallet/webhook/paystack:
 *   post:
 *     summary: Paystack webhook handler
 *     description: Handle Paystack webhooks for payment notifications
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid webhook signature
 */

/**
 * @swagger
 * /api/wallet/escrow/lock:
 *   post:
 *     summary: Lock funds in escrow
 *     description: Lock funds in escrow for a job transaction
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - jobId
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Amount to lock in escrow
 *                 example: 10000
 *               jobId:
 *                 type: string
 *                 description: Job ID for which funds are being locked
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Funds locked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     walletId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     referenceId:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid amount or insufficient balance
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wallet/escrow/release:
 *   post:
 *     summary: Release escrow funds
 *     description: Release escrow funds after job completion (splits into payout and commission). Wallet ID is automatically derived from authenticated user.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - artisanAmount
 *               - commissionAmount
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID for which funds are being released
 *                 example: 507f1f77bcf86cd799439011
 *               artisanAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount to pay to artisan (95%)
 *                 example: 9500
 *               commissionAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Platform commission (5%)
 *                 example: 500
 *     responses:
 *       200:
 *         description: Funds released successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     payoutTransaction:
 *                       type: object
 *                     commissionTransaction:
 *                       type: object
 *       400:
 *         description: Missing required fields or insufficient escrow balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
