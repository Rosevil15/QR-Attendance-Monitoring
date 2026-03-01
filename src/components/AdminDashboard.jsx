import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    fetchAttendance()
  }, [filterDate])

  const fetchAttendance = async () => {
    setLoading(true)
    let query = supabase
      .from('attendance')
      .select('*')
      .order('datetime', { ascending: false })

    if (filterDate) {
      const startOfDay = new Date(filterDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filterDate)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('datetime', startOfDay.toISOString())
        .lte('datetime', endOfDay.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
    } else {
      setAttendance(data || [])
    }
    setLoading(false)
  }

  const formatDateTime = (datetime) => {
    const date = new Date(datetime)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.setTextColor(30, 60, 114)
    doc.text('Attendance Report', 14, 22)
    
    // Add date info
    doc.setFontSize(11)
    doc.setTextColor(100)
    if (filterDate) {
      doc.text(`Date: ${new Date(filterDate).toLocaleDateString()}`, 14, 32)
    } else {
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
    }
    doc.text(`Total Records: ${attendance.length}`, 14, 38)
    
    // Prepare table data
    const tableData = attendance.map(record => {
      const { date, time } = formatDateTime(record.datetime)
      return [
        record.student_id,
        date,
        time,
        record.status
      ]
    })
    
    // Add table
    doc.autoTable({
      startY: 45,
      head: [['Student ID', 'Date', 'Time', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 60, 114],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 45 }
    })
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    const fileName = `attendance_${filterDate || 'all'}_${new Date().getTime()}.pdf`
    doc.save(fileName)
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#1e3c72',
        marginBottom: '20px',
        fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
        textAlign: 'center'
      }}>
        📊 Attendance Dashboard
      </h2>

      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ 
            padding: '10px 15px',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            outline: 'none',
            minWidth: '150px'
          }}
        />
        <button
          onClick={() => setFilterDate('')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          Clear
        </button>
        <button
          onClick={exportToPDF}
          disabled={attendance.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: attendance.length === 0 ? '#ccc' : '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: attendance.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: attendance.length === 0 ? 'none' : '0 2px 10px rgba(211, 47, 47, 0.3)'
          }}
        >
          📄 Export PDF
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ 
            fontSize: '40px',
            marginBottom: '10px'
          }}>⏳</div>
          <p>Loading...</p>
        </div>
      ) : attendance.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          color: '#999'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>📭</div>
          <p style={{ fontSize: '18px' }}>No attendance records found</p>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '15px',
            padding: '10px 15px',
            background: '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#1e3c72'
          }}>
            Total Records: {attendance.length}
          </div>

          {/* Mobile Card View */}
          <div style={{ display: 'block' }}>
            {attendance.map((record) => {
              const { date, time } = formatDateTime(record.datetime)
              return (
                <div
                  key={record.id}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '15px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '5px'
                      }}>
                        Student ID
                      </div>
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1e3c72'
                      }}>
                        {record.student_id}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '5px'
                      }}>
                        Date & Time
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {date}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {time}
                      </div>
                    </div>
                    
                    <div>
                      <span style={{
                        padding: '8px 16px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        ✓ {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
