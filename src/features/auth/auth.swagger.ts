/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication and identity management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@kroxt.io
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *               role:
 *                 type: string
 *                 enum: [user, artisan, admin]
 *                 example: user
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               nin:
 *                 type: string
 *               stateOfOrigin:
 *                 type: string
 *               nationality:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request / Password policy failed
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@kroxt.io
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful. Cookies will be set.
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: IP Banned (Kroxt Defense)
 *       429:
 *         description: Too many attempts
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh Session
 *     tags: [Auth]
 *     description: Rotates access token using refreshToken cookie.
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Session expired
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     summary: Change Password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password changed and all other sessions revoked
 *       401:
 *         description: Unauthorized
 */
export const authSwagger = {};
