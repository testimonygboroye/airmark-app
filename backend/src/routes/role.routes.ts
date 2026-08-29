import { Router } from "express";
import * as roleController from "../controllers/role.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createRoleSchema, updateRoleSchema, deleteRoleSchema } from "../validators/role.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.ROLE_MANAGE));

router.get("/", roleController.listTeamRoles);
router.post("/", validate(createRoleSchema), roleController.createRole);
router.patch("/:roleId", validate(updateRoleSchema), roleController.updateRole);
router.delete("/:roleId", validate(deleteRoleSchema), roleController.deleteRole);

export default router;
