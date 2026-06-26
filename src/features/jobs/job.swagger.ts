/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management and lifecycle
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - customerId
 *         - serviceId
 *         - title
 *         - description
 *         - location
 *         - budget
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           description: Auto-generated ID
 *         customerId:
 *           type: string
 *           description: ID of the customer who created the job
 *           example: "507f1f77bcf86cd799439011"
 *         serviceId:
 *           type: string
 *           description: ID of the service category
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           example: "Need electrical wiring for 3-bedroom apartment"
 *         description:
 *           type: string
 *           example: "Complete electrical installation including sockets, switches, and lighting fixtures"
 *         location:
 *           type: string
 *           example: "Ikeja, Lagos"
 *         budget:
 *           type: number
 *           example: 150000
 *         status:
 *           type: string
 *           enum: [OPEN, NEGOTIATING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, ESCROW_LOCKED, CLOSED]
 *           default: OPEN
 *           example: "OPEN"
 *         acceptedQuoteId:
 *           type: string
 *           nullable: true
 *           description: ID of the accepted quote
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
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - serviceId
 *               - title
 *               - description
 *               - location
 *               - budget
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               serviceId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               title:
 *                 type: string
 *                 example: "Need electrical wiring for 3-bedroom apartment"
 *               description:
 *                 type: string
 *                 example: "Complete electrical installation including sockets, switches, and lighting fixtures"
 *               location:
 *                 type: string
 *                 example: "Ikeja, Lagos"
 *               budget:
 *                 type: number
 *                 example: 150000
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job created successfully"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request / validation failed
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: List all jobs with filters
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, NEGOTIATING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, ESCROW_LOCKED, CLOSED]
 *         description: Filter by job status
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         description: Filter by service ID
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 * 
 *   patch:
 *     summary: Update job details
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated job title"
 *               description:
 *                 type: string
 *                 example: "Updated job description"
 *               location:
 *                 type: string
 *                 example: "Lekki, Lagos"
 *               budget:
 *                 type: number
 *                 example: 200000
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job updated successfully"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request / validation failed
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 * 
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job deleted successfully"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}/quotes:
 *   get:
 *     summary: Get all quotes for a specific job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of quotes for the job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quotes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quote'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}/start:
 *   patch:
 *     summary: Start a job (requires escrow lock)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job started successfully"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request / escrow lock failed
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}/complete:
 *   patch:
 *     summary: Mark job as completed
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job marked as completed"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}/confirm:
 *   patch:
 *     summary: Confirm job completion and release payment
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job confirmed and closed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job confirmed and closed"
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       required:
 *         - jobId
 *         - artisanId
 *         - price
 *         - description
 *         - estimatedDuration
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           description: Auto-generated ID
 *         jobId:
 *           type: string
 *           description: ID of the job
 *           example: "507f1f77bcf86cd799439013"
 *         artisanId:
 *           type: string
 *           description: ID of the artisan submitting the quote
 *           example: "507f1f77bcf86cd799439014"
 *         price:
 *           type: number
 *           example: 120000
 *         description:
 *           type: string
 *           example: "Complete electrical installation with premium materials"
 *         estimatedDuration:
 *           type: string
 *           example: "3 days"
 *         materials:
 *           type: string
 *           example: "Includes all wiring, sockets, switches, and LED bulbs"
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, COUNTERED]
 *           default: PENDING
 *           example: "PENDING"
 *         counterOffer:
 *           type: number
 *           nullable: true
 *           example: 110000
 *         createdAt:
 *           type: string
 *           readOnly: true
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           readOnly: true
 *           format: date-time
 */
export const jobSwagger = {};
