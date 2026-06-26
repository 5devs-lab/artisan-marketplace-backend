/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Quote negotiation and management
 */

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Submit a quote for a job (Artisans only)
 *     tags: [Quotes]
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
 *               - artisanId
 *               - price
 *               - description
 *               - estimatedDuration
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               artisanId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *               price:
 *                 type: number
 *                 example: 120000
 *               description:
 *                 type: string
 *                 example: "Complete electrical installation with premium materials"
 *               estimatedDuration:
 *                 type: string
 *                 example: "3 days"
 *               materials:
 *                 type: string
 *                 example: "Includes all wiring, sockets, switches, and LED bulbs"
 *     responses:
 *       201:
 *         description: Quote created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quote created successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / validation failed / job not open for quoting
 *       403:
 *         description: Forbidden (Not an artisan)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Get quote details by ID
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 * 
 *   patch:
 *     summary: Update quote details
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 example: 130000
 *               description:
 *                 type: string
 *                 example: "Updated description with additional services"
 *               estimatedDuration:
 *                 type: string
 *                 example: "4 days"
 *               materials:
 *                 type: string
 *                 example: "Updated materials list"
 *     responses:
 *       200:
 *         description: Quote updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quote updated successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / cannot edit accepted quote
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 * 
 *   delete:
 *     summary: Delete a quote
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quote deleted successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / cannot delete accepted quote
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/quotes/{id}/accept:
 *   post:
 *     summary: Accept a quote (Customer only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quote accepted successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / quote cannot be accepted in current state
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/quotes/{id}/reject:
 *   post:
 *     summary: Reject a quote (Customer only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quote rejected successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / cannot reject accepted quote
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/quotes/{id}/counter:
 *   post:
 *     summary: Submit a counter offer (Customer only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - counterPrice
 *             properties:
 *               counterPrice:
 *                 type: number
 *                 example: 110000
 *     responses:
 *       200:
 *         description: Counter offer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Counter offer submitted successfully"
 *                 quote:
 *                   $ref: '#/components/schemas/Quote'
 *       400:
 *         description: Bad request / cannot counter accepted quote
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Unauthorized
 */
export const quoteSwagger = {};
