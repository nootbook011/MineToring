/*
* thanks prismarine-physics library for code reference 
*/

const EPSILON = 1e-7

export class AABB {
  constructor(x0, y0, z0, x1, y1, z1) {
    this.minX = x0
    this.minY = y0
    this.minZ = z0
    this.maxX = x1
    this.maxY = y1
    this.maxZ = z1
  }

  static fromBedrock(cx, cy, cz, sx, sy, sz) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2
    return new AABB(
      cx - hx,
      cy - hy,
      cz - hz,
      cx + hx,
      cy + hy,
      cx + hz
    )
  }

  clone() {
    return new AABB(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ)
  }

  floor() {
    this.minX = Math.floor(this.minX)
    this.minY = Math.floor(this.minY)
    this.minZ = Math.floor(this.minZ)
    this.maxX = Math.floor(this.maxX)
    this.maxY = Math.floor(this.maxY)
    this.maxZ = Math.floor(this.maxZ)
    return this
  }

  extend(dx, dy, dz) {
    if (dx < 0) this.minX += dx
    else this.maxX += dx

    if (dy < 0) this.minY += dy
    else this.maxY += dy

    if (dz < 0) this.minZ += dz
    else this.maxZ += dz

    return this
  }

  contract(x, y, z) {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX -= x
    this.maxY -= y
    this.maxZ -= z
    return this
  }

  expand(x, y, z) {
    this.minX -= x
    this.minY -= y
    this.minZ -= z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

  offset(x, y, z) {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

  computeOffsetX(other, offsetX) {
    if (other.maxY > this.minY + EPSILON && other.minY < this.maxY - EPSILON && other.maxZ > this.minZ + EPSILON && other.minZ < this.maxZ - EPSILON) {
      if (offsetX > 0.0 && other.maxX <= this.minX + EPSILON) {
        const d = this.minX - other.maxX
        if (d < offsetX) offsetX = d
      } else if (offsetX < 0.0 && other.minX >= this.maxX - EPSILON) {
        const d = this.maxX - other.minX
        if (d > offsetX) offsetX = d
      }
    }
    return offsetX
  }

  computeOffsetY(other, offsetY) {
    if (other.maxX > this.minX + EPSILON && other.minX < this.maxX - EPSILON && other.maxZ > this.minZ + EPSILON && other.minZ < this.maxZ - EPSILON) {
      if (offsetY > 0.0 && other.maxY <= this.minY + EPSILON) {
        const d = this.minY - other.maxY
        if (d < offsetY) offsetY = d
      } else if (offsetY < 0.0 && other.minY >= this.maxY - EPSILON) {
        const d = this.maxY - other.minY
        if (d > offsetY) offsetY = d
      }
    }
    return offsetY
  }

  computeOffsetZ(other, offsetZ) {
    if (other.maxX > this.minX + EPSILON && other.minX < this.maxX - EPSILON && other.maxY > this.minY + EPSILON && other.minY < this.maxY - EPSILON) {
      if (offsetZ > 0.0 && other.maxZ <= this.minZ + EPSILON) {
        const d = this.minZ - other.maxZ
        if (d < offsetZ) offsetZ = d
      } else if (offsetZ < 0.0 && other.minZ >= this.maxZ - EPSILON) {
        const d = this.maxZ - other.minZ
        if (d > offsetZ) offsetZ = d
      }
    }
    return offsetZ
  }

  intersects(other) {
    return this.minX < other.maxX - EPSILON && this.maxX > other.minX + EPSILON &&
      this.minY < other.maxY - EPSILON && this.maxY > other.minY + EPSILON &&
      this.minZ < other.maxZ - EPSILON && this.maxZ > other.minZ + EPSILON
  }
}