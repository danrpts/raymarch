# General
- [ ] Comments
- [ ] Tests
- [ ] Document function signatures and return values
- [ ] Application functionality 'builds' the shader

# Geometry 
- [ ] Define more Cartesian primitives

# Application
- [ ] Ui / Ux
- [ ] Split material properties out
- [ ] Split camera controls out
- [ ] Split out light properties/controls
- [ ] Abstract state from DOM
- [ ] Modules globals/state
- [ ] Console controls
- [ ] Debugger logs
- [ ] Split shader code up 

# Canvas
- [ ] Aspect ratio
- [ ] Responsive

# Render Controls
- [ ] Allow bouncing of light rays by discrete amount (raytracing / nontrivial)
- [ ] Fogging
- [x] Shadows
- [ ] Blend shadows into scene for softness
- [x] Anti aliasing / super-sampling
- [ ] Fix SSAA about center pixel
- [ ] Support different types of SSAA
- [ ] Granularity
- [ ] Depth of field

# Shading Controls
- [ ] Ui
- [ ] Switch between shading models
- [ ] Phong
- [ ] Flat/Smooth
- [ ] Ambient Occlusion

# Material Properties
- [ ] Ui
- [ ] Texture upload
- [x] Texture mapping
- [ ] Move texel calculation to object definition

# Camera Controls
- [ ] Ui
- [ ] ! Fix warping due to projection (might be correct)
- [ ] Near/far frustrum (will improve rendering speed)
- [ ] Depth of field
- [x] Virtual trackball movement for camera rotations
- [x] Trackball rotation about arbitrary axis
- [ ] Use quarternian rotations to avoid Gimble lock
- [x] Project points outside of trackball on to the hemisphere
- [x] Fix bug when mouse drags to very edge of canvas
- [ ] Splines

# Light Properties
- [ ] Ui
- [ ] Point light creation
- [ ] Volumetric Lighting
- [x] Look for bugs in phong shading
