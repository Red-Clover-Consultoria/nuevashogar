import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import useProduct from 'vtex.product-context/useProduct'
import productInfo from './productInfo.graphql'
import styles from './styles.css'
import { paymentMethodGroups, defaultValues, paymentOptionsIcons, paymentMethodIcons } from './data.js'



const CalculadorCuotas = () => {
  const [paymentMethodGroupActive, setPaymentMethodGroupActive] = useState('creditCardPaymentGroup');
  const [checkedOption, setCheckedOption] = useState(defaultValues[paymentMethodGroupActive])
  const [isVisible, setIsVisible] = useState(false);


  const { product } = useProduct()

  const { data, loading, error } = useQuery(productInfo, {
    variables: {
      slug: product.linkText,
    },
    ssr: false,
  })

  if (!product) {
    return (
      <div>
        <span>There is no product context.</span>
      </div>
    )
  }
  if (loading) {
    return (
      <div>
        <div className={styles.spinner}></div>
      </div>
    )
  }
  if (data) {
    const datos = data.product.items;

    const url = window.location;

    let caracteres = url.href.slice(-4);

    let info;


    if (caracteres.includes("/p")) {
      const reference = document.querySelector(".vtex-product-identifier-0-x-product-identifier__value").innerHTML;

      datos.forEach(dato => {

        if (reference === dato.referenceId[0].Value && dato.sellers[0].commertialOffer.Installments.length !== 0) {
          info = dato.sellers[0].commertialOffer.Installments;

        } else {
          info = data.product.items[0].sellers[0].commertialOffer.Installments;

        }

      })

    } else {
      datos.forEach(dato => {
        let indexCaracter = url.href.indexOf("=");
        let indexFinal = indexCaracter + 1
        let sku = url.href.slice(indexFinal);


        if (sku === dato.itemId && dato.sellers[0].commertialOffer.Installments.length !== 0) {
          console.log(dato)
          info = dato.sellers[0].commertialOffer.Installments;
          // info = data.product.items[0].sellers[0].commertialOffer.Installments;
        }
      })
    }

    const paymentMethods = info.reduce((acc, item) => {
      if (!acc.includes(item.PaymentSystemGroupName)) {
        acc.push(item.PaymentSystemGroupName);
      }
      return acc;
    }, [])

    const handlePayment = (e) => {
      setPaymentMethodGroupActive(e.target.value)
      setCheckedOption(defaultValues[e.target.value])
    }

    if (info.length === 0) {
      return (
        <>
          <div className='sinCuotas'>Actualmente sin información</div>
          <div className='sinCuotasInfo'>Podrás acceder a la información de cuotas cuando elijas tu método de pago al finalizar la compra.</div>
        </>
      )
    }

    return (
      <>
        {isVisible ?
          <div className={styles.paymentContainer}>
            <div className={styles.container}>
              {/* RENDER MEDIANTE SELECT */}

              <div className={`${styles.paymentMethodSelectWrapper}`}>
                <select className={`list pl0 flex flex-column`} onChange={handlePayment} value={paymentMethodGroupActive} name="paymentMethodGroup" style={{ padding: "5px 10px", fontWeight: "bold", margin: "3px", borderRadius: "5px", background: 'white', border: "1px solid #ccc" }}>
                  {paymentMethods.map((paymentMethod, i) => {
                    if (paymentMethod !== "promissoryPaymentGroup") {
                      return (
                        <option key={i} value={paymentMethod} className={paymentMethod === paymentMethodGroupActive ? styles.paymentMethodActive : styles.paymentMethodInactive}>
                          {paymentMethodGroups[paymentMethod] ?? 'Mercado Pago'}
                        </option>
                      );
                    }
                  })}
                </select>
              </div>

              <div className={styles.tarjetasCuotas}>
                <PaymentMethodInfo info={info} paymentMethodGroupActive={paymentMethodGroupActive} checkedOption={checkedOption} setCheckedOption={setCheckedOption} />
              </div>
            </div>
            {/* BOTON CLOSE  */}
            <span style={{ position: 'absolute', top: 20, right: 10, cursor: 'pointer' }} onClick={() => setIsVisible(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-square-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M9 9l6 6m0 -6l-6 6" /></svg>
            </span>
            {/* ////// */}
          </div>
          :
          // BOTON PARA VISUALIZAR CUOTAS Y MEDIOS DE PAGO 
          <button onClick={() => setIsVisible(true)} style={{ marginTop: "15px", padding: '10px 5px', borderRadius: '5px', backgroundColor: 'white', border: "solid 1px #ccc", color: "#0070EF", display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '18px' }}
          >
            <img src='https://nuevashogarar.vtexassets.com/assets/vtex.file-manager-graphql/images/dc3a302a-36b3-4c92-bdb8-95338d417fc9___58c64d08b48869e33a5f290e4a64aed8.png' alt='tarjeta' width={30} height={30} />
            <span>Ver cuotas y medios de pago</span>
          </button>

        }
      </>
    )
  }

  if (error) {
    return (<p>Información no disponible</p>)
  }
}

const PaymentMethodInfo = ({ paymentMethodGroupActive, info, checkedOption, setCheckedOption }) => {

  // Filtrar las opciones de pago para el grupo activo
  const paymentOptions = info
    .filter(item => item.PaymentSystemGroupName === paymentMethodGroupActive)
    .map(item => item.PaymentSystemName);

  // Eliminar duplicados de las opciones de pago
  const paymentOptionsClean = [...new Set(paymentOptions)];

  // Manejar el cambio de opción
  const handleOptions = (e) => {
    setCheckedOption(e.target.value);
  };

  // Renderizar diferentes mensajes según el grupo de pago activo
  if (paymentMethodGroupActive === 'custom201PaymentGroupPaymentGroup') {
    return (
      <p className="pago">Pagá el importe total a través de una transferencia bancaria.</p>
    );
  } else if (paymentMethodGroupActive === 'custom202PaymentGroupPaymentGroup') {
    return (
      <p>Pagá el importe total en nuestras sucursales.</p>
    );
  }


  return (

    <div className={styles.paymentOptionsContainer
    } >
      <ul className="list pl0 flex flex-wrap" onChange={handleOptions}>
        {paymentOptionsClean.map((paymentOption, i) => {
          return (
            <li key={i} className={paymentOption === checkedOption ? styles.paymentOptionActive : styles.paymentOptionInactive}>
              <label className={styles.opcionTarjeta}>
                <img src={paymentOptionsIcons[paymentOption] ? paymentOptionsIcons[paymentOption] : 'https://nhorizontesa.vteximg.com.br/arquivos/icono-ejemplo-modal.png'} alt={paymentOption} className={styles.cardIcon} />
                <input type='radio' className="o-0" name='paymentOption' value={paymentOption} checked={paymentOption === checkedOption && true} onChange={handleOptions} />
                <p className={styles.paymentOption}>{paymentOption}</p>
              </label>
            </li>
          )
        })}
      </ul>
      <Installments checkedOption={checkedOption} info={info} />
    </div >
  )
}

const CantidadC = ({ checkedOption, info }) => {
  return (
    console.log('hola mundo this is a test')
  )
}

const Installments = ({ checkedOption, info }) => {
  console.log(info)
  return (
    <div className={styles.tablaDiv}>
      <table className={styles.tablaCuotas} >
        <thead className={styles.tablaHead}>
          <tr className={styles.tableHeaders}>
            <td>Cuotas</td>
            <td>Interés</td>
            <td>Valor Total</td>
          </tr>
        </thead>
        <tbody className={styles.tablaBody}>
          {info.map(({ InterestRate, PaymentSystemName, NumberOfInstallments, Value, TotalValuePlusInterestRate }, i) => {
            if (PaymentSystemName === checkedOption) {
              return (
                <tr key={i} className="pa1 pv6">
                  <td>{NumberOfInstallments} {NumberOfInstallments === 1 ? 'cuota' : 'cuotas'} de ${Value.toLocaleString()}</td>
                  <td><strong className={InterestRate === 0 || InterestRate === null ? styles.interestZero : styles.interest}>{InterestRate === 0 || InterestRate === null ? ' Sin interés' : InterestRate + '%'}</strong> </td>
                  <td><strong> ${TotalValuePlusInterestRate.toLocaleString()}</strong></td>
                </tr>
              )
            }
          })}
        </tbody>
      </table>
    </div>
  )
}


export default CalculadorCuotas