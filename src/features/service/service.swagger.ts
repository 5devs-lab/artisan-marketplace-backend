/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Artisan service management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - basePrice
 *         - location
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           description: Auto-generated ID
 *         artisanId:
 *           type: string
 *           readOnly: true
 *           description: Reference to the artisan user
 *         title:
 *           type: string
 *           example: Professional House Wiring
 *         description:
 *           type: string
 *           example: Comprehensive electrical wiring for residential buildings with 1-year warranty.
 *         category:
 *           type: string
 *           example: Electrical
 *         basePrice:
 *           type: number
 *           example: 50000
 *         location:
 *           type: object
 *           required:
 *             - address
 *             - city
 *             - state
 *           properties:
 *             address:
 *               type: string
 *               example: 123 Tech Avenue
 *             city:
 *               type: string
 *               example: Ikeja
 *             state:
 *               type: string
 *               example: Lagos
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/p1.jpg", "https://example.com/p2.jpg"]
 *         isAvailable:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           readOnly: true
 *           format: date-time
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (Artisans only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       403:
 *         description: Forbidden (Not an artisan)
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: List all services with filters
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search on title and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of services
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service details by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 * 
 *   patch:
 *     summary: Update an existing service (Owner only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated
 *       403:
 *         description: Forbidden (Not the owner)
 * 
 *   delete:
 *     summary: Delete a service (Owner only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service deleted
 *       403:
 *         description: Forbidden (Not the owner)
 */
export const serviceSwagger = {};
