/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     tags: [Health]
 *     description: Check if the server is alive and connected to the database.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 *       500:
 *         description: Server error
 */
export const healthSwagger = {};
