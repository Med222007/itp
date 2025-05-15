import FullCalendar from '@fullcalendar/react'; // Integración con React
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin para la vista de día
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin para la vista de semana/día
import interactionPlugin from '@fullcalendar/interaction'; // Para la interacción con clics
import esLocale from '@fullcalendar/core/locales/es';//para idioma en español del calendario
import "../calendar.css"



export function Calendario({onDayClick, selectedDay,diasReservados}){
  const diasReservadosSet = new Set(diasReservados.map(dia => dia.fecha));
    return (
        <div className="w-full h-full">
          <FullCalendar
            locales={{esLocale}}//importamos la localizacion
            locale="es"//especificamos el español como idioma
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
            }}
            height={"100%"}
            dayCellClassNames={({ date }) => {
              const diaFormateado = date.toISOString().split('T')[0];
      
              if (diasReservadosSet.has(diaFormateado)) {
                return 'sunday'; 
              }
              if(diaFormateado === selectedDay) {
                  return 'bg-gray-300'; // Día seleccionado en gris
              } else if (date.getDay() === 0) {
                  return 'sunday'; // Clase para los domingos
              }
              return ''; // Otros días sin clase adicional
            }}
            dateClick={onDayClick}
          />
           
            
        </div>
    );
}