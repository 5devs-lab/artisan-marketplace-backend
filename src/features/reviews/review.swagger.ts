/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review and rating management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - jobId
 *         - reviewerId
 *         - revieweeId
 *         - rating
 *         - comment
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           description: Auto-generated ID
 *         jobId:
 *           type: string
 *           description: ID of the completed job
 *           example: "507f1f77bcf86cd799439013"
 *         reviewerId:
 *           type: string
 *           description: ID of the user writing the review
 *           example: "507f1f77bcf86cd799439011"
 *         revieweeId:
 *           type: string
 *           description: ID of the user being reviewed
 *           example: "507f1f77bcf86cd799439014"
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Excellent work! Very professional and completed on time."
 *         createdAt:
 *           type: string
 *           readOnly: true
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           readOnly: true
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a completed job
 *     tags: [Reviews]
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
 *               - reviewerId
 *               - revieweeId
 *               - rating
 *               - comment
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               reviewerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               revieweeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excellent work! Very professional and completed on time."
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review created successfully"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Bad request / validation failed / job not completed
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reviews/artisan/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a specific artisan
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Artisan ID
 *     responses:
 *       200:
 *         description: List of reviews for the artisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reviews/artisan/{id}/average-rating:
 *   get:
 *     summary: Get average rating for a specific artisan
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Artisan ID
 *     responses:
 *       200:
 *         description: Average rating
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   example: 4.5
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review details by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 * 
 *   patch:
 *     summary: Update review details
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Updated comment with more details"
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review updated successfully"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Bad request / validation failed
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 * 
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
export const reviewSwagger = {};
