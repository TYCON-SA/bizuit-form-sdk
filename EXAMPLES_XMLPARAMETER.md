# XmlParameter - Ejemplos Prácticos

Esta guía contiene ejemplos completos y reales de cómo usar `XmlParameter` en diferentes escenarios.

## 📋 Tabla de Contenidos

1. [Ejemplo 1: Formulario Simple con Validación](#ejemplo-1-formulario-simple-con-validación)
2. [Ejemplo 2: Gestión de Deudores con Contactos](#ejemplo-2-gestión-de-deudores-con-contactos)
3. [Ejemplo 3: Lista de Productos con Arrays](#ejemplo-3-lista-de-productos-con-arrays)
4. [Ejemplo 4: Formulario Multi-Paso](#ejemplo-4-formulario-multi-paso)
5. [Ejemplo 5: Edición de Instancia Existente](#ejemplo-5-edición-de-instancia-existente)
6. [Ejemplo 6: Validación Custom y Transformación](#ejemplo-6-validación-custom-y-transformación)

---

## Ejemplo 1: Formulario Simple con Validación

**Escenario**: Formulario de alta de persona con validación antes de enviar.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

interface PersonaFormData {
  nombre: string
  apellido: string
  edad: number
  email: string
}

export function PersonaForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [formData, setFormData] = useState<PersonaFormData>({
    nombre: '',
    apellido: '',
    edad: 0,
    email: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      // Crear XmlParameter manualmente (sin XSD)
      const param = new XmlParameter('pPersona', {
        Persona: {
          Nombre: null,
          Apellido: null,
          Edad: null,
          Email: null
        }
      }, 'In')

      // Llenar desde form data con mapping
      param.fillFrom(formData, {
        nombre: 'Persona.Nombre',
        apellido: 'Persona.Apellido',
        edad: 'Persona.Edad',
        email: 'Persona.Email'
      })

      // Validar antes de enviar
      const missing = param.validate()
      if (missing.length > 0) {
        setErrors(missing)
        setLoading(false)
        return
      }

      // Enviar al proceso
      const result = await sdk.process.start({
        processName: 'AltaPersona',
        parameters: [param]
      }, [], token)

      console.log('Proceso creado:', result.instanceId)
      alert('Persona registrada exitosamente!')

      // Limpiar formulario
      setFormData({ nombre: '', apellido: '', edad: 0, email: '' })

    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Alta de Persona</h2>

      {errors.length > 0 && (
        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-bold">Campos requeridos:</h3>
          <ul className="list-disc ml-4">
            {errors.map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
      />

      <input
        type="text"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={e => setFormData({ ...formData, apellido: e.target.value })}
      />

      <input
        type="number"
        placeholder="Edad"
        value={formData.edad}
        onChange={e => setFormData({ ...formData, edad: parseInt(e.target.value) })}
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Registrar Persona'}
      </button>
    </form>
  )
}
```

---

## Ejemplo 2: Gestión de Deudores con Contactos

**Escenario**: Formulario complejo con arrays dinámicos de contactos.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

interface Contacto {
  tipo: 'email' | 'telefono' | 'domicilio'
  valor: string
}

interface DeudorFormData {
  id: number
  nombre: string
  tipoDocumento: string
  numeroDocumento: string
  contactos: Contacto[]
}

export function DeudorForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [formData, setFormData] = useState<DeudorFormData>({
    id: 0,
    nombre: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    contactos: [{ tipo: 'email', valor: '' }]
  })

  const addContacto = () => {
    setFormData({
      ...formData,
      contactos: [...formData.contactos, { tipo: 'email', valor: '' }]
    })
  }

  const removeContacto = (index: number) => {
    setFormData({
      ...formData,
      contactos: formData.contactos.filter((_, i) => i !== index)
    })
  }

  const updateContacto = (index: number, field: 'tipo' | 'valor', value: string) => {
    const updated = [...formData.contactos]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, contactos: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Crear XmlParameter con template
      const param = new XmlParameter('pDeudor', {
        Deudor: {
          ID: null,
          Nombre: null,
          TipoDocumento: null,
          NumeroDocumento: null,
          Contactos: {
            Contacto: []
          }
        }
      }, 'In')

      // Llenar datos básicos
      param.fillFrom(formData, {
        id: 'Deudor.ID',
        nombre: 'Deudor.Nombre',
        tipoDocumento: 'Deudor.TipoDocumento',
        numeroDocumento: 'Deudor.NumeroDocumento'
      })

      // Agregar contactos uno por uno
      formData.contactos.forEach((contacto, index) => {
        param.setByPath(`Deudor.Contactos.Contacto[${index}].Tipo`, contacto.tipo)
        param.setByPath(`Deudor.Contactos.Contacto[${index}].Valor`, contacto.valor)
      })

      // Validar
      const missing = param.validate()
      if (missing.length > 0) {
        alert(`Faltan campos: ${missing.join(', ')}`)
        return
      }

      // Log para debug
      console.log('Datos a enviar:', param.toJSON())

      // Enviar
      const result = await sdk.process.start({
        processName: 'GestionDeudor',
        parameters: [param]
      }, [], token)

      alert(`Deudor creado! ID: ${result.instanceId}`)

    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear deudor')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2>Gestión de Deudor</h2>

      <div>
        <label>ID:</label>
        <input
          type="number"
          value={formData.id}
          onChange={e => setFormData({ ...formData, id: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={e => setFormData({ ...formData, nombre: e.target.value })}
        />
      </div>

      <div>
        <label>Tipo Documento:</label>
        <select
          value={formData.tipoDocumento}
          onChange={e => setFormData({ ...formData, tipoDocumento: e.target.value })}
        >
          <option value="DNI">DNI</option>
          <option value="CUIT">CUIT</option>
          <option value="Pasaporte">Pasaporte</option>
        </select>
      </div>

      <div>
        <label>Número Documento:</label>
        <input
          type="text"
          value={formData.numeroDocumento}
          onChange={e => setFormData({ ...formData, numeroDocumento: e.target.value })}
        />
      </div>

      <div>
        <h3>Contactos</h3>
        {formData.contactos.map((contacto, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={contacto.tipo}
              onChange={e => updateContacto(index, 'tipo', e.target.value)}
            >
              <option value="email">Email</option>
              <option value="telefono">Teléfono</option>
              <option value="domicilio">Domicilio</option>
            </select>

            <input
              type="text"
              value={contacto.valor}
              onChange={e => updateContacto(index, 'valor', e.target.value)}
              placeholder={`Ingrese ${contacto.tipo}`}
            />

            <button type="button" onClick={() => removeContacto(index)}>
              Eliminar
            </button>
          </div>
        ))}

        <button type="button" onClick={addContacto}>
          + Agregar Contacto
        </button>
      </div>

      <button type="submit">Guardar Deudor</button>
    </form>
  )
}
```

---

## Ejemplo 3: Lista de Productos con Arrays

**Escenario**: Alta de múltiples productos en un solo envío.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

interface Producto {
  codigo: string
  descripcion: string
  precio: number
  stock: number
}

export function ProductosForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [productos, setProductos] = useState<Producto[]>([
    { codigo: '', descripcion: '', precio: 0, stock: 0 }
  ])

  const addProducto = () => {
    setProductos([...productos, { codigo: '', descripcion: '', precio: 0, stock: 0 }])
  }

  const removeProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index))
  }

  const updateProducto = (index: number, field: keyof Producto, value: any) => {
    const updated = [...productos]
    updated[index] = { ...updated[index], [field]: value }
    setProductos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Crear XmlParameter
      const param = new XmlParameter('pProductos', {
        raiz: {
          productos: {
            producto: []
          }
        }
      }, 'In')

      // Llenar productos usando setByPath
      productos.forEach((prod, index) => {
        param.setByPath(`raiz.productos.producto[${index}].codigo`, prod.codigo)
        param.setByPath(`raiz.productos.producto[${index}].descripcion`, prod.descripcion)
        param.setByPath(`raiz.productos.producto[${index}].precio`, prod.precio)
        param.setByPath(`raiz.productos.producto[${index}].stock`, prod.stock)
      })

      // Validar
      const missing = param.validate()
      if (missing.length > 0) {
        alert(`Faltan campos: ${missing.join(', ')}`)
        return
      }

      // Enviar
      const result = await sdk.process.start({
        processName: 'AltaProductos',
        parameters: [param]
      }, [], token)

      alert(`${productos.length} productos creados! ID: ${result.instanceId}`)
      setProductos([{ codigo: '', descripcion: '', precio: 0, stock: 0 }])

    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear productos')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Alta de Productos</h2>

      {productos.map((prod, index) => (
        <div key={index} className="border p-4 rounded">
          <h3>Producto #{index + 1}</h3>

          <input
            type="text"
            placeholder="Código"
            value={prod.codigo}
            onChange={e => updateProducto(index, 'codigo', e.target.value)}
          />

          <input
            type="text"
            placeholder="Descripción"
            value={prod.descripcion}
            onChange={e => updateProducto(index, 'descripcion', e.target.value)}
          />

          <input
            type="number"
            placeholder="Precio"
            value={prod.precio}
            onChange={e => updateProducto(index, 'precio', parseFloat(e.target.value))}
          />

          <input
            type="number"
            placeholder="Stock"
            value={prod.stock}
            onChange={e => updateProducto(index, 'stock', parseInt(e.target.value))}
          />

          {productos.length > 1 && (
            <button type="button" onClick={() => removeProducto(index)}>
              Eliminar
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addProducto}>
        + Agregar Producto
      </button>

      <button type="submit">Crear {productos.length} Producto(s)</button>
    </form>
  )
}
```

---

## Ejemplo 4: Formulario Multi-Paso

**Escenario**: Formulario dividido en pasos, guardando estado con `clone()`.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

export function MultiStepForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [step, setStep] = useState(1)
  const [param, setParam] = useState<XmlParameter | null>(null)
  const [snapshots, setSnapshots] = useState<Record<number, XmlParameter>>({})

  // Inicializar XmlParameter al montar
  useState(() => {
    const p = new XmlParameter('pSolicitud', {
      Solicitud: {
        DatosPersonales: {
          Nombre: null,
          Apellido: null,
          Email: null
        },
        DatosLaborales: {
          Empresa: null,
          Cargo: null,
          Antiguedad: null
        },
        Documentacion: {
          DNI: null,
          ReciboDeSueldo: null
        }
      }
    }, 'In')

    setParam(p)
  })

  const saveSnapshot = () => {
    if (param) {
      setSnapshots({ ...snapshots, [step]: param.clone() })
    }
  }

  const nextStep = () => {
    saveSnapshot()
    setStep(step + 1)
  }

  const prevStep = () => {
    // Restaurar snapshot del paso anterior
    if (snapshots[step - 1]) {
      setParam(snapshots[step - 1].clone())
    }
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!param) return

    try {
      // Validar
      const missing = param.validate()
      if (missing.length > 0) {
        alert(`Faltan campos: ${missing.join(', ')}`)
        return
      }

      // Enviar
      const result = await sdk.process.start({
        processName: 'SolicitudCredito',
        parameters: [param]
      }, [], token)

      alert(`Solicitud enviada! ID: ${result.instanceId}`)

    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar solicitud')
    }
  }

  if (!param) return <div>Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h2>Solicitud de Crédito</h2>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 p-2 text-center ${
              s === step ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Paso {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3>Datos Personales</h3>

          <input
            type="text"
            placeholder="Nombre"
            value={param.getByPath('Solicitud.DatosPersonales.Nombre') || ''}
            onChange={e => param.setByPath('Solicitud.DatosPersonales.Nombre', e.target.value)}
          />

          <input
            type="text"
            placeholder="Apellido"
            value={param.getByPath('Solicitud.DatosPersonales.Apellido') || ''}
            onChange={e => param.setByPath('Solicitud.DatosPersonales.Apellido', e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={param.getByPath('Solicitud.DatosPersonales.Email') || ''}
            onChange={e => param.setByPath('Solicitud.DatosPersonales.Email', e.target.value)}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3>Datos Laborales</h3>

          <input
            type="text"
            placeholder="Empresa"
            value={param.getByPath('Solicitud.DatosLaborales.Empresa') || ''}
            onChange={e => param.setByPath('Solicitud.DatosLaborales.Empresa', e.target.value)}
          />

          <input
            type="text"
            placeholder="Cargo"
            value={param.getByPath('Solicitud.DatosLaborales.Cargo') || ''}
            onChange={e => param.setByPath('Solicitud.DatosLaborales.Cargo', e.target.value)}
          />

          <input
            type="number"
            placeholder="Antigüedad (años)"
            value={param.getByPath('Solicitud.DatosLaborales.Antiguedad') || ''}
            onChange={e => param.setByPath('Solicitud.DatosLaborales.Antiguedad', parseInt(e.target.value))}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3>Documentación</h3>

          <input
            type="text"
            placeholder="DNI"
            value={param.getByPath('Solicitud.Documentacion.DNI') || ''}
            onChange={e => param.setByPath('Solicitud.Documentacion.DNI', e.target.value)}
          />

          <input
            type="text"
            placeholder="Recibo de Sueldo"
            value={param.getByPath('Solicitud.Documentacion.ReciboDeSueldo') || ''}
            onChange={e => param.setByPath('Solicitud.Documentacion.ReciboDeSueldo', e.target.value)}
          />

          <div className="bg-yellow-100 p-4 rounded">
            <h4>Resumen:</h4>
            <pre>{param.toJSON()}</pre>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        {step > 1 && (
          <button type="button" onClick={prevStep}>
            ← Anterior
          </button>
        )}

        {step < 3 && (
          <button type="button" onClick={nextStep}>
            Siguiente →
          </button>
        )}

        {step === 3 && (
          <button type="button" onClick={handleSubmit}>
            Enviar Solicitud
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## Ejemplo 5: Edición de Instancia Existente

**Escenario**: Cargar datos de instancia existente, modificar y continuar.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState, useEffect } from 'react'

export function EditarDeudorForm({ instanceId }: { instanceId: string }) {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [param, setParam] = useState<XmlParameter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInstance()
  }, [instanceId])

  const loadInstance = async () => {
    try {
      // Obtener datos de la instancia
      const instanceData = await sdk.process.getInstanceData(instanceId, token)

      // Encontrar el parámetro XML
      const xmlParam = instanceData.parameters?.find(
        p => p.name === 'pDeudor' && p.parameterType === 'Json'
      )

      if (!xmlParam) {
        throw new Error('Parámetro pDeudor no encontrado')
      }

      // Crear XmlParameter con los datos existentes
      const p = new XmlParameter('pDeudor', xmlParam.value, 'InOut')
      setParam(p)
      setLoading(false)

    } catch (error) {
      console.error('Error cargando instancia:', error)
      alert('Error al cargar datos')
    }
  }

  const handleSave = async () => {
    if (!param) return

    try {
      // Validar cambios
      const missing = param.validate()
      if (missing.length > 0) {
        alert(`Faltan campos: ${missing.join(', ')}`)
        return
      }

      // Continuar instancia con datos modificados
      const result = await sdk.process.continue({
        instanceId,
        processName: 'GestionDeudor',
        parameters: [param]
      }, [], token)

      alert('Cambios guardados exitosamente!')

    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar cambios')
    }
  }

  if (loading) return <div>Cargando...</div>
  if (!param) return <div>Error al cargar datos</div>

  return (
    <div className="space-y-4">
      <h2>Editar Deudor (ID: {instanceId})</h2>

      <div>
        <label>ID:</label>
        <input
          type="number"
          value={param.getByPath('Deudor.ID') || ''}
          onChange={e => param.setByPath('Deudor.ID', parseInt(e.target.value))}
        />
      </div>

      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={param.getByPath('Deudor.Nombre') || ''}
          onChange={e => param.setByPath('Deudor.Nombre', e.target.value)}
        />
      </div>

      <div>
        <label>Tipo Documento:</label>
        <input
          type="text"
          value={param.getByPath('Deudor.TipoDocumento') || ''}
          onChange={e => param.setByPath('Deudor.TipoDocumento', e.target.value)}
        />
      </div>

      <div>
        <h3>Contactos:</h3>
        {param.getByPath('Deudor.Contactos.Contacto')?.map((contacto: any, index: number) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={contacto.Tipo}
              onChange={e => param.setByPath(`Deudor.Contactos.Contacto[${index}].Tipo`, e.target.value)}
            />
            <input
              type="text"
              value={contacto.Valor}
              onChange={e => param.setByPath(`Deudor.Contactos.Contacto[${index}].Valor`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave}>
          Guardar Cambios
        </button>

        <button onClick={() => param.reset()}>
          Restaurar Original
        </button>
      </div>
    </div>
  )
}
```

---

## Ejemplo 6: Validación Custom y Transformación

**Escenario**: Validaciones personalizadas y transformación de datos antes de enviar.

```typescript
import { useBizuitSDK, XmlParameter } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

export function FacturaForm() {
  const sdk = useBizuitSDK()
  const [token] = useToken()
  const [formData, setFormData] = useState({
    cliente: '',
    items: [
      { descripcion: '', cantidad: 1, precio: 0 }
    ]
  })

  const validateFactura = (param: XmlParameter): string[] => {
    const errors: string[] = []

    // Validación custom: al menos 1 item
    const items = param.getByPath('Factura.Items.Item') || []
    if (items.length === 0) {
      errors.push('Debe haber al menos 1 item')
    }

    // Validación custom: total mínimo
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.Cantidad * item.Precio)
    }, 0)

    if (total < 100) {
      errors.push('El total debe ser al menos $100')
    }

    // Validación custom: cantidades positivas
    items.forEach((item: any, index: number) => {
      if (item.Cantidad <= 0) {
        errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`)
      }
      if (item.Precio <= 0) {
        errors.push(`Item ${index + 1}: Precio debe ser mayor a 0`)
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Crear XmlParameter
      const param = new XmlParameter('pFactura', {
        Factura: {
          Cliente: null,
          Fecha: null,
          Items: {
            Item: []
          },
          Total: null
        }
      }, 'In')

      // Llenar cliente y fecha
      param.setByPath('Factura.Cliente', formData.cliente)
      param.setByPath('Factura.Fecha', new Date().toISOString())

      // Llenar items
      formData.items.forEach((item, index) => {
        param.setByPath(`Factura.Items.Item[${index}].Descripcion`, item.descripcion)
        param.setByPath(`Factura.Items.Item[${index}].Cantidad`, item.cantidad)
        param.setByPath(`Factura.Items.Item[${index}].Precio`, item.precio)

        // Calcular subtotal por item
        const subtotal = item.cantidad * item.precio
        param.setByPath(`Factura.Items.Item[${index}].Subtotal`, subtotal)
      })

      // Calcular total general
      const total = formData.items.reduce((sum, item) => {
        return sum + (item.cantidad * item.precio)
      }, 0)
      param.setByPath('Factura.Total', total)

      // Validación estándar
      const missing = param.validate()
      if (missing.length > 0) {
        alert(`Faltan campos: ${missing.join(', ')}`)
        return
      }

      // Validación custom
      const customErrors = validateFactura(param)
      if (customErrors.length > 0) {
        alert(`Errores de validación:\n${customErrors.join('\n')}`)
        return
      }

      // Log para debug
      console.log('Factura a enviar:', param.toJSON())

      // Enviar
      const result = await sdk.process.start({
        processName: 'GenerarFactura',
        parameters: [param]
      }, [], token)

      alert(`Factura generada! ID: ${result.instanceId}\nTotal: $${total}`)

    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar factura')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Generar Factura</h2>

      <div>
        <label>Cliente:</label>
        <input
          type="text"
          value={formData.cliente}
          onChange={e => setFormData({ ...formData, cliente: e.target.value })}
        />
      </div>

      <div>
        <h3>Items</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="border p-4">
            <input
              type="text"
              placeholder="Descripción"
              value={item.descripcion}
              onChange={e => {
                const items = [...formData.items]
                items[index].descripcion = e.target.value
                setFormData({ ...formData, items })
              }}
            />

            <input
              type="number"
              placeholder="Cantidad"
              value={item.cantidad}
              onChange={e => {
                const items = [...formData.items]
                items[index].cantidad = parseInt(e.target.value)
                setFormData({ ...formData, items })
              }}
            />

            <input
              type="number"
              placeholder="Precio"
              value={item.precio}
              onChange={e => {
                const items = [...formData.items]
                items[index].precio = parseFloat(e.target.value)
                setFormData({ ...formData, items })
              }}
            />

            <p>Subtotal: ${item.cantidad * item.precio}</p>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            items: [...formData.items, { descripcion: '', cantidad: 1, precio: 0 }]
          })}
        >
          + Agregar Item
        </button>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h3>Total: ${formData.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0)}</h3>
      </div>

      <button type="submit">Generar Factura</button>
    </form>
  )
}
```

---

## 🎯 Patrones Comunes

### Pattern 1: Validar y Transformar

```typescript
// 1. Crear parámetro
const param = new XmlParameter('pData', template, 'In')

// 2. Llenar datos
param.fillFrom(formData, mapping)

// 3. Transformar/enriquecer
param.setByPath('Data.FechaCreacion', new Date().toISOString())
param.setByPath('Data.Usuario', currentUser.username)

// 4. Validar
const missing = param.validate()
if (missing.length > 0) {
  throw new Error(`Faltan: ${missing.join(', ')}`)
}

// 5. Enviar
await sdk.process.start({ parameters: [param] }, [], token)
```

### Pattern 2: Merge Multiple Sources

```typescript
const param = new XmlParameter('pData', template, 'In')

// Merge de múltiples fuentes
param.merge(defaultData)
param.merge(userData)
param.merge(sessionData)

// Resultado: combinación de todas las fuentes
```

### Pattern 3: Clone for Undo/Redo

```typescript
const history: XmlParameter[] = []
let current = new XmlParameter('pData', template, 'In')

// Guardar snapshot
history.push(current.clone())

// Hacer cambios
current.setByPath('Data.Nombre', 'Nuevo valor')

// Undo
current = history.pop()!
```

---

**Versión**: 2.1.0+
**Última actualización**: 2025-11-25
