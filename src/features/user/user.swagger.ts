/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and management
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get Current User Profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Returns the profile data associated with the current session.
 *     responses:
 *       200:
 *         description: Profile data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     nin:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     stateOfOrigin:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     address:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update User Profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Updates the profile information for the current user. Only allowed fields are updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               stateOfOrigin:
 *                 type: string
 *               nationality:
 *                 type: string
 *               address:
 *                 type: string
 *               nin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request / validation failed
 *       401:
 *         description: Unauthorized
 */
export const userSwagger = {};
